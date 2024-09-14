import { DocumentBuilder } from '@nestjs/swagger';

export class APIDocumentationConfig {
  private readonly builder = new DocumentBuilder();

  public buildOptions() {
    return this.builder
      .setTitle('E-Commerce API')
      .setDescription('API documentation for the E-Commerce platform')
      .setVersion('1.0.0')
      .build();
  }
}
