import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as yaml from 'js-yaml';
import { BusinessConfigModule } from './business-config/business-config.module';
import { RunManageModule } from './run-manage/run-manage.module';
import { ExecutionModule } from './execution/execution.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { Config } from './types';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => {
        try {
          const envPath = resolve(__dirname, '../../..', 'env.yaml');
          const envConfig = readFileSync(envPath, 'utf8');
          const config = yaml.load(envConfig) as Record<string, any>;
          return config;
        } catch (error) {
          Logger.error('Failed to load env.yaml', error);
          return {};
        }
      }],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const database = configService.get<Config['database']>('database');
        return {
          type: 'sqlite',
          database: database?.path || './data/database.sqlite',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        }
      },
    }),
    BusinessConfigModule,
    RunManageModule,
    ExecutionModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
