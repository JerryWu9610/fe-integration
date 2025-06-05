import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginatedResDto } from '../../common/dto/pagination.dto';
import { ExecuteRunReqDto } from './execute-run.dto';

// Base DTO
export class ScheduleConfigDto {
  @ApiProperty({
    description: 'Configuration ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Schedule name',
    example: 'Daily Integration Test'
  })
  name: string;

  @ApiProperty({
    description: 'Schedule description',
    example: 'Run integration test every day at 2 AM'
  })
  description: string;

  @ApiProperty({
    description: 'Cron expression for scheduling',
    example: '0 2 * * *'
  })
  cronExpression: string;

  @ApiProperty({
    description: 'Whether the schedule is enabled',
    example: true
  })
  isEnabled: boolean;

  @ApiProperty({
    description: 'Input parameters',
    example: {
      procedureId: 'local-integration',
      product: 'xdr-local',
      stepParams: {
        'fe-integration': {
          baselineBranch: 'main',
          targetBranch: 'feature-xyz'
        }
      }
    }
  })
  input: Record<string, any>;

  @ApiProperty({
    description: 'Created by',
    example: 'system'
  })
  createdBy: string;

  @ApiProperty({
    description: 'Updated by',
    example: 'system'
  })
  updatedBy: string;

  @ApiProperty({
    description: 'Creation time',
    example: '2024-03-20T10:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update time',
    example: '2024-03-20T10:00:00Z'
  })
  updatedAt: Date;
}

// Request DTOs
export class CreateScheduleReqDto extends ExecuteRunReqDto {
  @ApiProperty({
    description: 'Schedule name',
    example: 'Daily Integration Test',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Schedule description',
    example: 'Run integration test every day at 2 AM',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Cron expression for scheduling',
    example: '0 2 * * *',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  cronExpression: string;

  @ApiProperty({
    description: 'Whether the schedule is enabled',
    example: true,
    required: false,
    default: true
  })
  @IsOptional()
  isEnabled?: boolean = true;
}

export class UpdateScheduleReqDto {
  @ApiProperty({
    description: 'Schedule configuration ID',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'Schedule name',
    example: 'Daily Integration Test',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Schedule description',
    example: 'Run integration test every day at 2 AM',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Cron expression for scheduling',
    example: '0 2 * * *',
    required: false
  })
  @IsString()
  @IsOptional()
  cronExpression?: string;

  @ApiProperty({
    description: 'Whether the schedule is enabled',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @ApiProperty({
    description: 'Parameters for each step in the flow',
    example: {
      'fe-integration': {
        baselineBranch: 'main',
        targetBranch: 'feature-xyz'
      },
      'fe-pack': {
        baselineBranch: 'main',
        targetBranch: 'feature-xyz'
      }
    },
    required: false
  })
  @IsOptional()
  input?: Record<string, any>;
}

export class GetSchedulesReqDto {
  @ApiProperty({
    description: 'Page number (1-based)',
    example: 1,
    required: false,
    default: 1
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of records per page',
    example: 10,
    required: false,
    default: 10
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  pageSize?: number = 10;
}

// Response DTOs
export class GetScheduleResDto extends PaginatedResDto<ScheduleConfigDto> {
  @ApiProperty({
    description: 'Array of schedule configurations',
    type: () => ScheduleConfigDto,
    isArray: true
  })
  declare data: ScheduleConfigDto[];
}

export class CreateScheduleResDto {
  @ApiProperty({
    description: 'Created schedule configuration',
    type: () => ScheduleConfigDto
  })
  data: ScheduleConfigDto;
}

export class UpdateScheduleResDto {
  @ApiProperty({
    description: 'Updated schedule configuration',
    type: () => ScheduleConfigDto
  })
  data: ScheduleConfigDto;
}

export class DeleteScheduleResDto {
  @ApiProperty({
    description: 'Whether the deletion was successful',
    example: true
  })
  success: boolean;
}

export class DeleteScheduleReqDto {
  @ApiProperty({
    description: 'Schedule configuration ID',
    example: 1,
    required: true
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  id: number;
} 
