import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RunRecord } from './entities/run-record.entity';
import { ExecuteRunReqDto } from './dto/execute-run.dto';
import { RunRecordStatus, RunRecordTriggerType } from './consts';
import { 
  CreateScheduleReqDto,
  UpdateScheduleReqDto,
  GetSchedulesReqDto,
  GetScheduleResDto,
  CreateScheduleResDto,
  UpdateScheduleResDto,
  DeleteScheduleResDto
} from './dto/schedule-config.dto';
import { ScheduleConfig } from './entities/schedule-config.entity';
import { 
  PaginatedRunRecordResDto,
  ManualTriggerResDto,
  GetRunRecordsReqDto
} from './dto/run-record.dto';
import { ExecutionService } from '../execution/execution.service';

@Injectable()
export class RunManageService implements OnModuleInit {
  constructor(
    @InjectRepository(RunRecord)
    private runRecordRepository: Repository<RunRecord>,
    @InjectRepository(ScheduleConfig)
    private scheduleConfigRepository: Repository<ScheduleConfig>,
    private executionService: ExecutionService,
  ) {}

  private formatLogMessage(message: string): string {
    return `[${new Date().toISOString()}] ${message}`;
  }

  async onModuleInit() {
    // 服务启动时，将所有 PENDING 状态的记录更新为 FAILED
    const pendingRecords = await this.runRecordRepository.find({
      where: { status: RunRecordStatus.PENDING }
    });

    for (const record of pendingRecords) {
      const newLog = [record.log, this.formatLogMessage('Service was restarted, execution interrupted')].filter(Boolean).join('\n')
      await this.runRecordRepository.update(
        { id: record.id },
        { 
          status: RunRecordStatus.FAILED,
          log: newLog
        }
      );
    }
  }

  async manualTrigger(params: ExecuteRunReqDto): Promise<ManualTriggerResDto> {
    const runRecord = this.runRecordRepository.create({
      log: '',
      input: params,
      status: RunRecordStatus.PENDING,
      triggerType: RunRecordTriggerType.MANUAL,
      triggerBy: 'system' // TODO: 后续可以从用户上下文获取
    });

    const savedRecord = await this.runRecordRepository.save(runRecord);

    const updateLog = async (message: string) => {
      const currentRecord = await this.runRecordRepository.findOne({
        where: { id: savedRecord.id }
      });
      if (!currentRecord) return;

      const newLog = [currentRecord.log, this.formatLogMessage(message)].filter(Boolean).join('\n');
      await this.runRecordRepository.update(
        { id: savedRecord.id },
        { log: newLog }
      );
    };

    // Execute in background
    this.executionService.execute(
      {
        procedureId: params.procedureId,
        product: params.product,
        stepParams: params.stepParams,
      },
      updateLog
    ).then(async () => {
      // Update status to completed on success
      await this.runRecordRepository.update(
        { id: savedRecord.id },
        { status: RunRecordStatus.COMPLETED }
      );
    }).catch(async (error) => {
      // Update status to failed on error
      await this.runRecordRepository.update(
        { id: savedRecord.id },
        { status: RunRecordStatus.FAILED }
      );
      // Log the error but don't throw it since this is running in background
      console.error(`Execution failed for run record ${savedRecord.id}:`, error);
    });

    return { data: savedRecord };
  }

  async getRunRecords(query: GetRunRecordsReqDto): Promise<PaginatedRunRecordResDto> {
    const { page = 1, pageSize = 10 } = query;
    const skip = (page - 1) * pageSize;

    const [records, total] = await this.runRecordRepository.findAndCount({
      skip,
      take: pageSize,
      order: {
        createdAt: 'DESC'
      }
    });

    return {
      data: records,
      total
    };
  }

  async createSchedule(params: CreateScheduleReqDto): Promise<CreateScheduleResDto> {
    const { procedureId, product, stepParams, name, description, cronExpression, isEnabled = true } = params;

    const scheduleConfig = this.scheduleConfigRepository.create({
      name,
      description,
      cronExpression,
      isEnabled,
      input: {
        procedureId,
        product,
        stepParams
      },
      createdBy: 'system' // TODO: 后续可以从用户上下文获取
    });

    const savedConfig = await this.scheduleConfigRepository.save(scheduleConfig);
    return { data: savedConfig };
  }

  async updateSchedule(params: UpdateScheduleReqDto): Promise<UpdateScheduleResDto> {
    const { id, ...updateData } = params;

    // 查找现有配置
    const existingConfig = await this.scheduleConfigRepository.findOne({
      where: { id }
    });

    if (!existingConfig) {
      throw new NotFoundException(`Schedule configuration with id ${id} not found`);
    }

    // 如果提供了新的 input，需要合并原有的 input
    if (updateData.input) {
      updateData.input = {
        ...existingConfig.input,
        ...updateData.input
      };
    }

    // 更新配置
    await this.scheduleConfigRepository.update(
      { id },
      updateData
    );

    // 返回更新后的完整配置
    const updatedConfig = await this.scheduleConfigRepository.findOne({
      where: { id }
    });

    if (!updatedConfig) {
      throw new NotFoundException(`Schedule configuration with id ${id} not found after update`);
    }

    return { data: updatedConfig };
  }

  async getSchedules(query: GetSchedulesReqDto): Promise<GetScheduleResDto> {
    const { page = 1, pageSize = 10 } = query;
    const skip = (page - 1) * pageSize;

    const [schedules, total] = await this.scheduleConfigRepository.findAndCount({
      skip,
      take: pageSize,
      order: {
        createdAt: 'DESC'
      }
    });

    return {
      data: schedules,
      total
    };
  }

  async deleteSchedule(id: number): Promise<DeleteScheduleResDto> {
    const schedule = await this.scheduleConfigRepository.findOne({
      where: { id }
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule configuration with id ${id} not found`);
    }

    await this.scheduleConfigRepository.delete(id);
    return { success: true };
  }
}
