import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { promises as fs } from 'fs';
import { resolve } from 'path';
import * as yaml from 'js-yaml';
import { Config } from './business-config/types';
import { BusinessConfigModule } from './business-config/business-config.module';

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
    BusinessConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
