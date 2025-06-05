import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { promises as fs } from 'fs';
import { resolve } from 'path';
import * as yaml from 'js-yaml';
import { Config } from './business-config/types';
import { BusinessConfigModule } from './business-config/business-config.module';
import { RunManageModule } from './run-manage/run-manage.module';
import { ExecutionModule } from './execution/execution.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [async () => {
        const envFile = resolve(__dirname, '../../..', 'env.yaml');
      
        try {
          const fileContents = await fs.readFile(envFile, 'utf8');
          return yaml.load(fileContents) as Config;
        } catch (error) {
          throw new Error(`Failed to load configuration file: ${error.message}`);
        }
      }],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: resolve(__dirname, '../../..', 'data', 'database.sqlite'),
        entities: [resolve(__dirname, '**', '*.entity{.ts,.js}')],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    BusinessConfigModule,
    RunManageModule,
    ExecutionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
