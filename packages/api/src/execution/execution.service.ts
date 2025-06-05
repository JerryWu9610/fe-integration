import { Injectable } from '@nestjs/common';
import type { LogUpdateCallback } from './types';

@Injectable()
export class ExecutionService {
  constructor() {}

  async execute(
    params: {
      procedureId: string;
      product: string;
      stepParams: Record<string, any>;
    },
    updateLog: LogUpdateCallback
  ): Promise<void> {
    try {
      await updateLog('Starting execution...');
      
      // TODO: Add your execution logic here
      // You can use updateLog to record progress, for example:
      // await updateLog('Step 1 completed');
      // await updateLog('Step 2 in progress...');
      
      await updateLog('Execution completed successfully');
    } catch (error) {
      await updateLog(`Execution failed: ${error.message}`);
      throw error;
    }
  }
} 