import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResDto<T> {
  @ApiProperty({
    description: 'Array of items',
    type: 'array',
    isArray: true
  })
  data: T[];

  @ApiProperty({
    description: 'Total number of items',
    example: 100
  })
  total: number;
} 