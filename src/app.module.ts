import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomLoggerModule } from './core/custom_logger/custom-logger.module';
import { CustomLoggerService } from './core/custom_logger/logger.service';
import { GraphQLModule } from '@nestjs/graphql';
import databaseConfig from './common/configs/database.config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DirectiveLocation, GraphQLDirective } from 'graphql';
import { upperDirectiveTransformer } from './common/directives/upper-case.directive';
import { DatabaseModule } from './core/database/database.module';
import { AppResolver } from './app.resolver';
import { UsersModule } from './feature_module/user/user.module';
import { ProjectModule } from './feature_module/project/project.module';
import { PersonModule } from './feature_module/person/person.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      transformSchema: schema => upperDirectiveTransformer(schema, 'upper'),
      installSubscriptionHandlers: true,
      buildSchemaOptions: {
        directives: [
          new GraphQLDirective({
            name: 'upper',
            locations: [DirectiveLocation.FIELD_DEFINITION],
          }),
        ],
      },
    }),
    DatabaseModule,
    CustomLoggerModule,
    UsersModule,
    ProjectModule,
    PersonModule,
  ],
  providers: [AppResolver],
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
