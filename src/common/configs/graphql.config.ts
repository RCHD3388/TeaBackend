// src/config/graphql.config.ts
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLDirective, DirectiveLocation, GraphQLFormattedError } from 'graphql';
import { upperDirectiveTransformer } from '../directives/upper-case.directive';
import { ConfigService } from '@nestjs/config';

function CustomFormatError (error, isDev: boolean): GraphQLFormattedError {
  const defaultFormatError = {
    code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
    message: error.message || 'An error occurred',
    original: error.extensions?.originalError || null,
    details: {
      path: error.path,
      stacktrace: error.extensions?.stacktrace || null
    }
  };
  const prodDefaultFormatError = {
    code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
    message: error.message || 'An error occurred',
    original: error.extensions?.originalError || null,
  }; 
  if(isDev){
    return defaultFormatError
  }
  return prodDefaultFormatError
}

export function createGraphqlConfig(configService: ConfigService): ApolloDriverConfig{
  const isDev = configService.get<string>("APP_ENV") === "DEV"

  return {
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
    formatError: (error) => {
      return CustomFormatError(error, isDev)
    },
    context: ({ req }) => ({ req }),
  };
} 
