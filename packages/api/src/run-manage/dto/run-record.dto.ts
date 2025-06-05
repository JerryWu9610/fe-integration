import { ApiProperty } from '@nestjs/swagger';
import { RunRecordStatus, RunRecordTriggerType } from '../consts';
import { PaginatedResDto } from '../../common/dto/pagination.dto';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

// Request DTOs
export class GetRunRecordsReqDto {
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

// Base DTO
export class RunRecordDto {
  @ApiProperty({
    description: 'Record ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Execution log',
    example: ''
  })
  log: string;

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
    description: 'Record status',
    enum: RunRecordStatus,
    example: RunRecordStatus.PENDING
  })
  status: RunRecordStatus;

  @ApiProperty({
    description: 'Trigger type',
    enum: RunRecordTriggerType,
    example: RunRecordTriggerType.MANUAL
  })
  triggerType: RunRecordTriggerType;

  @ApiProperty({
    description: 'Triggered by',
    example: 'system'
  })
  triggerBy: string;

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

// Response DTOs
export class PaginatedRunRecordResDto extends PaginatedResDto<RunRecordDto> {
  @ApiProperty({
    description: 'Array of run records',
    type: () => RunRecordDto,
    isArray: true
  })
  declare data: RunRecordDto[];
}

export class ManualTriggerResDto {
  @ApiProperty({
    description: 'Created run record',
    type: () => RunRecordDto
  })
  data: RunRecordDto;
} 
