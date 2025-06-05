import { Module } from '@nestjs/common';
import { BusinessConfigController } from './business-config.controller';
import { BusinessConfigService } from './business-config.service';

@Module({
  controllers: [BusinessConfigController],
  providers: [BusinessConfigService],
  exports: [BusinessConfigService],
})
export class BusinessConfigModule {} 