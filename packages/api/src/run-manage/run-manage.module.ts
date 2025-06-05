import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RunManageController } from './run-manage.controller';
import { RunManageService } from './run-manage.service';
import { RunRecord } from './entities/run-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RunRecord])],
  controllers: [RunManageController],
  providers: [RunManageService],
  exports: [RunManageService],
})
export class RunManageModule {}
