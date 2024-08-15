import { Module } from '@nestjs/common';
import { WinstonModule, utilities as winstonUtilities } from 'nest-winston';
import { createLogger, format, transports } from 'winston';
import { CustomLoggerService } from './logger.service';

@Module({
  providers: [CustomLoggerService],
  exports: [CustomLoggerService]
})
export class CustomLoggerModule {}