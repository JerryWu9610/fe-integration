import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import type { ParamDef } from '../types';

export class GetProceduresReqDto {
  @ApiProperty({
    description: 'The product identifier',
    example: 'xdr-local',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  product: string;
}

export class StepDto {
  @ApiProperty({
    description: 'The unique identifier of the step',
    example: 'step-123'
  })
  id: string;

  @ApiProperty({
    description: 'The name of the step',
    example: 'Step Name'
  })
  name: string;

  @ApiProperty({
    description: 'The description of the step',
    example: 'Step Description'
  })
  description: string;

  @ApiProperty({
    description: 'The parameters definition of the step',
    example: {
      type: 'object',
      field: 'field',
      label: 'label',
    }
  })
  paramsDef: ParamDef[];
}

export class GetProceduresResDto {
  @ApiProperty({
    description: 'The unique identifier of the procedure',
    example: 'proc-123'
  })
  id: string;

  @ApiProperty({
    description: 'The steps of the procedure',
    type: [StepDto]
  })
  steps: StepDto[];
}
