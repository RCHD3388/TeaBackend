import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { CustomLoggerModule } from './modules/custom-logger/custom-logger.module';
import { CustomLoggerService } from './modules/custom-logger/logger.service';
import { UserModule } from './modules/user/user.module';
import databaseConfig from './configs/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true, 
      load: [databaseConfig]
    }),
    DatabaseModule,
    CustomLoggerModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly logger: CustomLoggerService,
    private readonly configService: ConfigService
  ) { }
  onModuleInit() {
    let appEnv: string = this.configService.get<string>("APP_ENV");
    this.logger.log(`App is running in \"${appEnv}\" mode`);
  }
}
