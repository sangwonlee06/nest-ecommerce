import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from './entities/logger.entity';
import { CreateLoggerDto } from './dto/create-logger.dto';
@Injectable()
export class LoggerService {
  constructor(
    @InjectRepository(Logger)
    private logsRepository: Repository<Logger>,
  ) {}

  async createLog(createLoggerDto: CreateLoggerDto) {
    const newLog = await this.logsRepository.create(createLoggerDto);
    await this.logsRepository.save(newLog, {
      data: {
        isCreatingLogs: true,
      },
    });
    return newLog;
  }
}
