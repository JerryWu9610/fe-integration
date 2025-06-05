import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsNotEmpty } from 'class-validator';

export class ExecuteRunReqDto {
  @ApiProperty({
    description: 'The flow identifier',
    example: 'local-integration',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  procedureId: string;
  
  @ApiProperty({
    description: 'The product type',
    example: 'xdr-local',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  product: string;

  @ApiProperty({
    description: 'Parameters for each step in the flow',
    example: {
      'fe-integration': {
        baselineBranch: 'main',
        targetBranch: 'feature-xyz'
      },
      'fe-pack': {
        baselineBranch: 'main',
        targetBranch: 'feature-xyz',
      }
    },
    required: true
  })
  @IsObject()
  @IsNotEmpty()
  stepParams: Record<string, Record<string, any>>;
} 