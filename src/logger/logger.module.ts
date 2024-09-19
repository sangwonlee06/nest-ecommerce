import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger } from './entities/logger.entity';
import { ConfigModule } from '@nestjs/config';
import { CustomLogger } from './customLogger';
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Logger])],
  controllers: [],
  providers: [LoggerService, CustomLogger],
  exports: [CustomLogger],
})
export class LoggerModule {}
