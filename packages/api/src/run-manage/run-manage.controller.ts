import { Controller, Post, Body } from '@nestjs/common';
import { RunManageService } from './run-manage.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExecuteRunReqDto } from './dto/execute-run.dto';
import { GetRunRecordsReqDto } from './dto/run-record.dto';
import { 
  CreateScheduleReqDto,
  UpdateScheduleReqDto,
  GetSchedulesReqDto,
  GetScheduleResDto,
  CreateScheduleResDto,
  UpdateScheduleResDto,
  DeleteScheduleResDto,
  DeleteScheduleReqDto,
} from './dto/schedule-config.dto';
import { 
  PaginatedRunRecordResDto,
  ManualTriggerResDto
} from './dto/run-record.dto';
import { Public } from '@module/auth/public.decorator';
import { CurrentUser } from '@module/auth/user.decorator';
import { UserAuthInfo } from '@module/auth/types';
import { ApiAuth } from '@common/decorators/api.decorator';

@ApiTags('Run Management')
@ApiAuth()
@Controller('run-manage')
export class RunManageController {
  constructor(private readonly runManageService: RunManageService) {}

  @ApiOperation({ summary: 'Manual trigger', description: 'Manually trigger a run' })
  @ApiResponse({ status: 200, type: ManualTriggerResDto })
  @Post('manual_trigger')
  async manualTrigger(
    @Body() body: ExecuteRunReqDto,
    @CurrentUser() user: UserAuthInfo,
  ): Promise<ManualTriggerResDto> {
    console.log('Current user:', user.name); // 获取用户名
    const data = await this.runManageService.manualTrigger(body);
    return data;
  }

  @ApiOperation({ summary: 'Get run records', description: 'Get paginated list of run records' })
  @ApiResponse({ status: 200, type: PaginatedRunRecordResDto })
  @Post('get_run_records')
  @Public()
  async getRunRecords(@Body() query: GetRunRecordsReqDto): Promise<PaginatedRunRecordResDto> {
    return this.runManageService.getRunRecords(query);
  }

  @ApiOperation({ summary: 'Create schedule run', description: 'Create a new scheduled run configuration' })
  @ApiResponse({ status: 200, type: CreateScheduleResDto })
  @Post('create_schedule')
  async createSchedule(@Body() body: CreateScheduleReqDto): Promise<CreateScheduleResDto> {
    const data = await this.runManageService.createSchedule(body);
    return data;
  }

  @ApiOperation({ summary: 'Update schedule run', description: 'Update an existing scheduled run configuration' })
  @ApiResponse({ status: 200, type: UpdateScheduleResDto })
  @Post('update_schedule')
  async updateSchedule(@Body() body: UpdateScheduleReqDto): Promise<UpdateScheduleResDto> {
    const data = await this.runManageService.updateSchedule(body);
    return data;
  }

  @ApiOperation({ summary: 'Get schedules', description: 'Get paginated list of schedule configurations' })
  @ApiResponse({ status: 200, type: GetScheduleResDto })
  @Post('get_schedules')
  @Public()
  async getSchedules(@Body() query: GetSchedulesReqDto): Promise<GetScheduleResDto> {
    return this.runManageService.getSchedules(query);
  }

  @ApiOperation({ summary: 'Delete schedule', description: 'Delete an existing scheduled run configuration' })
  @ApiResponse({ status: 200, type: DeleteScheduleResDto })
  @Post('delete_schedule')
  async deleteSchedule(@Body() body: DeleteScheduleReqDto): Promise<DeleteScheduleResDto> {
    return this.runManageService.deleteSchedule(body.id);
  }
}
