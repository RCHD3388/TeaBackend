// src/database/database.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { CustomLoggerModule } from 'src/core/custom-logger/custom-logger.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: DatabaseService.createMongooseOptions,
      inject: [ConfigService],
    }),
    CustomLoggerModule
  ],
  providers: [DatabaseService],
  exports: [MongooseModule],
})

export class DatabaseModule implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) { }
  onModuleInit() {
    this.databaseService.checkConnection();
  }
}
