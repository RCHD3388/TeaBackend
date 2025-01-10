import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomLoggerModule } from './core/custom_logger/custom-logger.module';
import { CustomLoggerService } from './core/custom_logger/logger.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DatabaseModule } from './core/database/database.module';
import { AppResolver } from './app.resolver';
import { UsersModule } from './feature_module/user/user.module';
import { ProjectModule } from './feature_module/project/project.module';
import { PersonModule } from './feature_module/person/person.module';
import { createGraphqlConfig } from './common/configs/graphql.config';
import { CategoryModule } from './feature_module/category/category.module';
import { InventoryModule } from './feature_module/inventory/inventory.module';
import { RequestModule } from './feature_module/request/request.module';
import { PurchasingModule } from './feature_module/purchasing/purchasing.module';
import { MailerModule } from './core/mailer/mailer.module';
import { ReportModule } from './feature_module/report/report.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createGraphqlConfig(configService),
    }),
    DatabaseModule,
    CustomLoggerModule,
    UsersModule,
    ProjectModule,
    PersonModule,
    CategoryModule,
    InventoryModule,
    RequestModule,
    PurchasingModule,
    MailerModule,
    ReportModule,
  ],
  providers: [AppResolver],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly logger: CustomLoggerService,
    private readonly configService: ConfigService,
  ) {}
  onModuleInit() {
    let appEnv: string = this.configService.get<string>('APP_ENV');
    this.logger.log(`App is running in \"${appEnv}\" mode`);
  }
}
