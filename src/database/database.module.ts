import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'src/configs/typeorm.config';
import { DatabaseService } from './database.service';
import { CustomLoggerModule } from 'src/custom-logger/custom-logger.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig
    }),
    CustomLoggerModule,
  ],
  providers: [DatabaseService],
  exports: [DatabaseService]
})

export class DatabaseModule implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) {}
  onModuleInit() {
    this.databaseService.checkConnection();
  }
}
