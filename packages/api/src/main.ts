import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from './types';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<Config>);
  
  // 设置全局路由前缀
  app.setGlobalPrefix('api');
  
  // 应用全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // 自动转换类型
    whitelist: true, // 去除未定义的属性
    forbidNonWhitelisted: false, // 允许未定义的属性
  }));
  
  // 应用全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // 应用全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('FE Integration API')
    .setDescription('前端集成服务 API 文档')
    .setVersion('1.0')
    .addTag('integration')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'PRIVATE-TOKEN',
        description: 'Enter Gitlab API Token',
        in: 'header',
      },
      'PRIVATE-TOKEN',
    )
    .addSecurityRequirements('PRIVATE-TOKEN')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      security: [{ 'PRIVATE-TOKEN': [] }],
    },
    customSiteTitle: 'FE Integration API',
    customCss: '.swagger-ui .topbar { display: none }',
    customJs: '/custom.js',
    customfavIcon: '/favicon.ico'
  });

  const port = configService.get('server.port', { infer: true }) ?? 3000;
  const host = configService.get('server.host', { infer: true }) ?? 'localhost';
  await app.listen(port, host);
}
bootstrap();
