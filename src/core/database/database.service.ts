// src/database/mongoose-config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, MongooseModuleOptions } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CustomLoggerService } from '../custom_logger/logger.service';

@Injectable()
export class DatabaseService {
  constructor(
    private logger: CustomLoggerService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  static async createMongooseOptions(configService: ConfigService): Promise<MongooseModuleOptions> {
    const url = configService.get<string>("database.url")
    const username = configService.get<string>("database.username")
    const password = configService.get<string>("database.password")
    const name = configService.get<string>("database.name");

    let uri = url.replace("<USERNAME>", username).replace("<PASSWORD>", password).replace("<DATABASE>", name);

    return {
      uri 
    };
  }
  checkConnection(){  
    if(this.connection.readyState == 1){
      this.logger.log(`MongoDB connection is successful to database ${this.connection.name} !`);
    }else{
      this.logger.log('MongoDB connection is successful!');
    }
  }
}
