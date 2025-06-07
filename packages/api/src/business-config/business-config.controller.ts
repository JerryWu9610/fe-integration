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
    const products = await this.businessConfigService.getProductList();
    return products.map(product => ({
      id: product.id,
      name: product.name,
    }));
  }

  @ApiOperation({ summary: 'Get procedures', description: 'Retrieves a list of procedures with their steps for a specific product' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved the procedures list',
    type: [GetProceduresResDto]
  })
  @Post('get_procedure_list')
  async getProcedureList(@Body() body: GetProceduresReqDto): Promise<GetProceduresResDto[]> {
    const procedures = await this.businessConfigService.getProcedureList({ product: body.product });
    return procedures.map(procedure => ({
      id: procedure.id,
      name: procedure.name,
      steps: procedure.steps.map(step => ({
        id: step.id,
        name: step.name,
        description: step.description,
        paramsDef: step.paramsDef,
      })),
    }));
  }
} 