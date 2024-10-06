import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomLoggerModule } from './modules/custom-logger/custom-logger.module';
import { CustomLoggerService } from './modules/custom-logger/logger.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DirectiveLocation, GraphQLDirective } from 'graphql';
import { upperDirectiveTransformer } from './common/directives/upper-case.directive';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true
    }),
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
    CustomLoggerModule,
  ],
  controllers: [],
  providers: [],
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
