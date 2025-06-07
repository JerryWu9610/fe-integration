import { Injectable } from '@nestjs/common';
import { BusinessConfigService } from '../business-config/business-config.service';
import { StepService } from './step.service';
import { LogUpdateCallback, StepHandlerParams, ExecuteParams, StepHandler } from './types';

@Injectable()
export class ExecutionService {
  private readonly stepHandlers: Record<string, StepHandler> = {
    'fe-integration': async (params: StepHandlerParams) => {
      await this.stepService.executeFeIntegration({
        product: params.product,
        procedureId: params.procedureId,
        businessRepoParams: params.stepParams.businessRepoParams || {},
        baselineBranch: params.stepParams.baselineBranch,
        targetBranch: params.stepParams.targetBranch,
      });
    },
    'fe-pack': async (params: StepHandlerParams) => {
      await this.stepService.executeFePack({
        product: params.product,
        procedureId: params.procedureId,
        targetBranch: params.stepParams.targetBranch,
        productType: params.stepParams.productType,
      });
    },
    'local-integration': async (params: StepHandlerParams) => {
      await this.stepService.executeLocalIntegration({
        product: params.product,
        procedureId: params.procedureId,
        baselineBranch: params.stepParams.baselineBranch,
        targetBranch: params.stepParams.targetBranch,
        createMergeRequest: params.stepParams.createMergeRequest,
      });
    },
    'cmp-integration': async (params: StepHandlerParams) => {
      await this.stepService.executeCmpIntegration({
        product: params.product,
        procedureId: params.procedureId,
        baselineBranch: params.stepParams.baselineBranch,
        targetBranch: params.stepParams.targetBranch,
        createMergeRequest: params.stepParams.createMergeRequest,
      });
    },
  };

  constructor(
    private readonly businessConfigService: BusinessConfigService,
    private readonly stepService: StepService,
  ) {}

  async execute(
    params: ExecuteParams,
    updateLog: LogUpdateCallback
  ): Promise<void> {
    try {
      await updateLog('Starting execution...');
      
      // Get procedure steps from business config
      const procedures = await this.businessConfigService.getProcedureList({ product: params.product });
      const procedure = procedures.find(p => p.id === params.procedureId);
      
      if (!procedure) {
        throw new Error(`Procedure ${params.procedureId} not found for product ${params.product}`);
      }

      // Execute each step in sequence
      for (const step of procedure.steps) {
        await updateLog(`Starting step: ${step.name} (${step.id})`);
        
        const stepParams = params.stepParams[step.id] || {};
        const handler = this.stepHandlers[step.id];
        
        if (!handler) {
          throw new Error(`Unknown step type: ${step.id}`);
        }
        
        try {
          await handler({
            product: params.product,
            procedureId: params.procedureId,
            stepParams,
          });
          
          await updateLog(`Step ${step.name} completed successfully`);
        } catch (error) {
          await updateLog(`Step ${step.name} failed: ${error.message}`);
          throw error;
        }
      }
      
      await updateLog('Execution completed successfully');
    } catch (error) {
      await updateLog(`Execution failed: ${error.message}`);
      throw error;
    }
  }
} 