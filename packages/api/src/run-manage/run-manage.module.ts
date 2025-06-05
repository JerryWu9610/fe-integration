import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RunManageController } from './run-manage.controller';
import { RunManageService } from './run-manage.service';
import { RunRecord } from './entities/run-record.entity';
import { ScheduleConfig } from './entities/schedule-config.entity';
import { ExecutionModule } from '../execution/execution.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RunRecord, ScheduleConfig]),
    ExecutionModule,
  ],
  controllers: [RunManageController],
  providers: [RunManageService],
  exports: [RunManageService],
})
export class RunManageModule {}
