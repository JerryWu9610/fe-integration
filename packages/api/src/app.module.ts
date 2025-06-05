import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import yamlConfig from './config/yaml.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [yamlConfig],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
