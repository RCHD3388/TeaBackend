import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseService } from '../database.service';
import { SeederService } from './seeder.service';
import { CustomLoggerModule } from 'src/modules/custom-logger/custom-logger.module';
import databaseConfig from 'src/configs/database.config';
import { UserSchema } from './schemas/user.schema';

@Module({})
export class SeederModule {
  static register(): DynamicModule {
    return {
      module: SeederModule,
      imports: [
        ConfigModule.forRoot({
          load: [databaseConfig],
          isGlobal: true,
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: DatabaseService.createMongooseOptions,
          inject: [ConfigService],
        }),
        MongooseModule.forFeature([
          { name: 'User', schema: UserSchema },
        ]),
        CustomLoggerModule,
      ],
      providers: [SeederService, DatabaseService],
    };
  }
}