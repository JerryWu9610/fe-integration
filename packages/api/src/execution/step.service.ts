import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { BusinessConfigService } from '../business-config/business-config.service';
import { Gitlab } from '@gitbeaker/rest';
import { ConfigService } from '@nestjs/config';
import { BusinessRepoParams } from './types';
import * as yaml from 'js-yaml';

@Injectable()
export class StepService {
  constructor(
    private readonly httpService: HttpService,
    private readonly businessConfigService: BusinessConfigService,
    private readonly configService: ConfigService,
  ) {}

  private validateExecuteFeIntegrationParams(params: {
    product: string;
    businessRepoParams: BusinessRepoParams;
    baselineBranch: string;
    targetBranch: string;
  }): void {
    if (!params.product) {
      throw new Error('Product is required');
    }
    if (!params.baselineBranch || !params.targetBranch) {
      throw new Error('Baseline branch and target branch are required');
    }
  }

  private async getBusinessRepos(params: {
    gitlab: InstanceType<typeof Gitlab>;
    projectId: number;
    product: string;
    branch: string;
  }): Promise<string[]> {
    const tree = await params.gitlab.Repositories.allRepositoryTrees(params.projectId, {
      ref: params.branch,
      path: `release/${params.product}`,
      recursive: false,
    });

    // Filter for yml files, exclude index.yml
    const ymlFiles = tree.filter(item => 
      item.type === 'blob' && 
      item.name.endsWith('.yml') && 
      item.name !== 'index.yml'
    );

    // Extract business repos from filenames (remove .yml extension)
    return ymlFiles.map(file => file.name.replace('.yml', ''));
  }

  private async getRepoPackageInfo(params: {
    gitlab: InstanceType<typeof Gitlab>;
    projectId: number;
    product: string;
    repo: string;
    branch: string;
  }): Promise<{ name: string; version: string }> {
    const ymlContent = await params.gitlab.RepositoryFiles.show(
      params.projectId,
      `release/${params.product}/${params.repo}.yml`,
      params.branch
    );
    
    const ymlData = yaml.load(Buffer.from(ymlContent.content, 'base64').toString()) as Record<string, any>;
    
    if (!ymlData.package?.name || !ymlData.package?.version) {
      throw new Error(`Invalid package info in ${params.repo}.yml`);
    }

    return {
      name: ymlData.package.name,
      version: ymlData.package.version,
    };
  }

  private async queryRepoVersion(params: {
    artifactRepoId: string;
    pkgName: string;
  }): Promise<string> {
    // TODO: Implement version query logic
    return '';
  }

  private async fillAutoValues(params: {
    product: string;
    branch: string;
    processedParams: Record<string, { name: string; version: string }>;
    repoPackageInfos: Record<string, { name: string; version: string }>;
  }): Promise<Record<string, { name: string; version: string }>> {
    const result = { ...params.processedParams };
    const businessRepoConfig = await this.businessConfigService.getBusinessRepoConfig(params.product);

    for (const [repo, repoParams] of Object.entries(result)) {
      if (repoParams.name === '[auto]') {
        // 从 repoPackageInfos 中获取 name
        const packageInfo = params.repoPackageInfos[repo];
        if (!packageInfo) {
          throw new Error(`Package info not found for repo ${repo}`);
        }
        repoParams.name = packageInfo.name;
      }

      if (repoParams.version === '[auto]') {
        // 获取该仓库的 artifactRepoId
        const repoConfig = businessRepoConfig[repo];
        if (!repoConfig) {
          throw new Error(`Repository config not found for ${repo}`);
        }

        // 调用 queryRepoVersion 获取版本号
        repoParams.version = await this.queryRepoVersion({
          artifactRepoId: repoConfig.artifact.repoId.toString(),
          pkgName: repoParams.name,
        });
      }
    }

    return result;
  }

  private processBusinessRepoParams(params: {
    businessRepos: string[];
    businessRepoParams: BusinessRepoParams;
  }): BusinessRepoParams {
    // If [auto] exists in params, apply it to all repos
    if (params.businessRepoParams['[auto]']) {
      const result: BusinessRepoParams = {};
      
      // Apply auto params to all repos
      params.businessRepos.forEach(repo => {
        result[repo] = {
          name: '[auto]',
          version: '[auto]',
        };
      });
      
      return result;
    }
    
    // Filter out repos that are not in businessRepos list
    const result: BusinessRepoParams = {};
    for (const [repo, repoParams] of Object.entries(params.businessRepoParams)) {
      if (params.businessRepos.includes(repo)) {
        result[repo] = repoParams;
      }
    }
    
    return result;
  }

  private async updateFilesAndCreateCommit(params: {
    gitlab: InstanceType<typeof Gitlab>;
    projectId: number;
    product: string;
    branch: string;
    targetBranch: string;
    filledParams: Record<string, { name: string; version: string }>;
    repoPackageInfos: Record<string, { name: string; version: string }>;
  }): Promise<void> {
    // 1. 创建新分支
    await params.gitlab.Branches.create(params.projectId, params.targetBranch, params.branch);

    // 2. 更新每个仓库的 YAML 文件
    for (const [repo, repoParams] of Object.entries(params.filledParams)) {
      const filePath = `release/${params.product}/${repo}.yml`;
      
      // 获取原始文件内容
      const originalContent = await params.gitlab.RepositoryFiles.show(
        params.projectId,
        filePath,
        params.branch
      );
      
      // 解析 YAML 内容
      const ymlData = yaml.load(Buffer.from(originalContent.content, 'base64').toString()) as Record<string, any>;
      
      // 更新 package 信息
      ymlData.package = {
        name: repoParams.name,
        version: repoParams.version,
      };
      
      // 将更新后的内容转换为 YAML
      const newContent = yaml.dump(ymlData);
      
      // 创建 commit 更新文件
      await params.gitlab.Commits.create(params.projectId, params.targetBranch, `Update ${repo} package info`, [{
        action: 'update',
        filePath,
        content: newContent,
      }]);
    }
  }

  async executeFeIntegration(params: {
    product: string;
    businessRepoParams: BusinessRepoParams;
    baselineBranch: string;
    targetBranch: string;
  }): Promise<void> {
    this.validateExecuteFeIntegrationParams(params);
    const feIntegrationRepoConfig = await this.businessConfigService.getFeIntegrationRepoConfig(params.product);
    
    // Create GitLab instance with the repository's token
    const gitlab = new Gitlab({
      host: feIntegrationRepoConfig.gitlab.apiBaseUrl,
      token: feIntegrationRepoConfig.gitlab.apiToken,
    });
    
    const businessRepos = await this.getBusinessRepos({
      gitlab,
      projectId: feIntegrationRepoConfig.gitlab.projectId,
      product: params.product,
      branch: params.baselineBranch,
    });
    
    // Process business repo params
    const processedParams = this.processBusinessRepoParams({
      businessRepos,
      businessRepoParams: params.businessRepoParams,
    });

    // Get package info for each repo
    const repoPackageInfos: Record<string, { name: string; version: string }> = {};
    for (const repo of Object.keys(processedParams)) {
      repoPackageInfos[repo] = await this.getRepoPackageInfo({
        gitlab,
        projectId: feIntegrationRepoConfig.gitlab.projectId,
        product: params.product,
        repo,
        branch: params.baselineBranch,
      });
    }

    // Fill [auto] values
    const filledParams = await this.fillAutoValues({
      product: params.product,
      branch: params.baselineBranch,
      processedParams,
      repoPackageInfos,
    });

    // Update files and create commit
    await this.updateFilesAndCreateCommit({
      gitlab,
      projectId: feIntegrationRepoConfig.gitlab.projectId,
      product: params.product,
      branch: params.baselineBranch,
      targetBranch: params.targetBranch,
      filledParams,
      repoPackageInfos,
    });
  }

  async executeFePack(params: {
    product: string;
    targetBranch: string;
    productType: string;
  }): Promise<void> {
    // TODO: 实现前端集成打包逻辑
  }

  async executeLocalIntegration(params: {
    product: string;
    baselineBranch: string;
    targetBranch: string;
    createMergeRequest: boolean;
  }): Promise<void> {
    // TODO: 实现分布式整包集成逻辑
  }

  async executeCmpIntegration(params: {
    product: string;
    baselineBranch: string;
    targetBranch: string;
    createMergeRequest: boolean;
  }): Promise<void> {
    // TODO: 实现CMP整包集成逻辑
  }
} 