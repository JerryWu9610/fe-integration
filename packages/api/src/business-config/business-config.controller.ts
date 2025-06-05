import { Controller, Post, Body } from '@nestjs/common';
import { BusinessConfigService } from './business-config.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetProductListResDto } from './dto/product.dto';
import { GetProceduresResDto, GetProceduresReqDto } from './dto/procedure.dto';

@ApiTags('Business Configuration')
@Controller('business-config')
export class BusinessConfigController {
  constructor(private readonly businessConfigService: BusinessConfigService) {}

  @ApiOperation({ summary: 'Get product list', description: 'Retrieves a list of all available products' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved the product list',
    type: [GetProductListResDto]
  })
  @Post('get_product_list')
  async getProductList(): Promise<GetProductListResDto[]> {
    return this.businessConfigService.getProductList();
  }

  @ApiOperation({ summary: 'Get procedures', description: 'Retrieves a list of procedures with their steps for a specific product' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved the procedures list',
    type: [GetProceduresResDto]
  })
  @Post('get_procedure_list')
  async getProcedureList(@Body() body: GetProceduresReqDto): Promise<GetProceduresResDto[]> {
    return this.businessConfigService.getProcedureList({ product: body.product });
  }
} 