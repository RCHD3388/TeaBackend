import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { CustomLoggerModule } from 'src/modules/custom-logger/custom-logger.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: configService.get<'postgres'|'mysql'|'mongodb'>(`DB_TYPE`),
        host: configService.get<string>(`database.host`),
        port: configService.get<number>(`database.port`),
        username: configService.get<string>(`database.username`),
        password: configService.get<string>(`database.password`),
        database: configService.get<string>(`database.database`),
        entities: [],
        autoLoadEntities: true,
        synchronize: false 
    })
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
