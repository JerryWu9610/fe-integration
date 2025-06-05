import { ApiProperty } from '@nestjs/swagger';

export class GetProductListResDto {
  @ApiProperty({
    description: 'The unique identifier of the product',
    example: '123'
  })
  id: string;

  @ApiProperty({
    description: 'The name of the product',
    example: 'Product Name'
  })
  name: string;

  // Add more properties as needed
} 