import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { APIDocumentationConfig } from './docs/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);

  const swaggerOptions = new APIDocumentationConfig().buildOptions();
  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(configService.get('PORT') ?? 8000);
}
bootstrap();
