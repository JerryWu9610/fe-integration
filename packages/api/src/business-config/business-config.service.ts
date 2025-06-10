import { Injectable } from '@nestjs/common';
import { resolve } from 'path';
import { BusinessConfigCacheItem, ProcedureConfigRoot, StepConfigRoot, ProductConfigRoot, ProductListItem, ProcedureListItem, GitLabConfig, ArtifactConfig, FeIntegrationRepoConfig, BusinessRepoConfig } from './types';
import { readFile } from 'fs/promises';

@Injectable()
export class BusinessConfigService {
  private cache: Record<string, BusinessConfigCacheItem<any>> = {};
  private readonly CACHE_TTL = 60 * 1000; // 1 minute in milliseconds
  private readonly CONFIG_DIR = resolve(__dirname, '../../../../config');

  private async readConfigFile<T>(fileName: string): Promise<T> {
    const now = Date.now();
    const cachedItem = this.cache[fileName];

    if (cachedItem && now - cachedItem.timestamp < this.CACHE_TTL) {
      return cachedItem.data;
    }

    const filePath = resolve(this.CONFIG_DIR, fileName);
    const fileContents = await readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContents) as T;
    
    this.cache[fileName] = {
      data,
      timestamp: now,
    };

    return data;
  }

  async getProductList(): Promise<ProductListItem[]> {
    const productConfig = await this.readConfigFile<ProductConfigRoot>('product.json');
    
    return Object.entries(productConfig).map(([id, config]) => ({
      id,
      name: config.name,
    }));
  }

  async getProcedureList({ product }: { product: string }): Promise<ProcedureListItem[]> {
    // 1. 读取产品配置，验证产品是否存在
    const productConfig = await this.readConfigFile<ProductConfigRoot>('product.json');
    if (!productConfig[product]) {
      throw new Error(`Product ${product} not found`);
    }

    // 2. 读取流程配置
    const procedureConfig = await this.readConfigFile<ProcedureConfigRoot>('procedure.json');
    
    // 3. 读取步骤配置
    const stepConfigMap = await this.readConfigFile<StepConfigRoot>('step.json');
    
    // 4. 获取该产品关联的流程列表
    const productProcedures = productConfig[product].procedures
      .map(procedureId => {
        const config = procedureConfig[procedureId];
        if (!config) {
          throw new Error(`Procedure ${procedureId} not found`);
        }

        return {
          id: procedureId,
          name: config.name,
          steps: config.steps.map(stepId => ({
            id: stepId,
            ...stepConfigMap[stepId],
          })),
        }
      });

    return productProcedures;
  }

  async getFeIntegrationRepoConfig(product: string): Promise<{ gitlab: GitLabConfig; artifact: ArtifactConfig }> {
    // 1. 读取产品配置，获取前端集成仓库名称
    const productConfig = await this.readConfigFile<ProductConfigRoot>('product.json');
    if (!productConfig[product]) {
      throw new Error(`Product ${product} not found`);
    }

    const feIntegrationRepo = productConfig[product].feIntegrationRepo;
    if (!feIntegrationRepo) {
      throw new Error(`FE integration repository not configured for product ${product}`);
    }

    // 2. 读取前端集成仓库配置
    const feIntegrationRepoConfig = await this.readConfigFile<FeIntegrationRepoConfig>('fe-integration-repo.json');
    if (!feIntegrationRepoConfig[feIntegrationRepo]) {
      throw new Error(`FE integration repository ${feIntegrationRepo} not found in configuration`);
    }

    return feIntegrationRepoConfig[feIntegrationRepo];
  }

  async getBusinessRepoConfig(product: string): Promise<BusinessRepoConfig> {
    // 1. 读取产品配置，获取业务仓库名称
    const productConfig = await this.readConfigFile<ProductConfigRoot>('product.json');
    if (!productConfig[product]) {
      throw new Error(`Product ${product} not found`);
    }

    // 2. 读取业务仓库配置
    const businessRepoConfig = await this.readConfigFile<BusinessRepoConfig>('business-repo.json');
    
    return businessRepoConfig;
  }
} 