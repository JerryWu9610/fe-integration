import { Module } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { StepService } from './step.service';
import { HttpModule } from '@nestjs/axios';
import { BusinessConfigModule } from '../business-config/business-config.module';

@Module({
  imports: [
    HttpModule,
    BusinessConfigModule,
  ],
  providers: [ExecutionService, StepService],
  exports: [ExecutionService],
})
export class ExecutionModule {}
