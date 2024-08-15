import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get<string>(`DB_${configService.get<string>('APP_ENV')}_HOST`),
    port: configService.get<number>(`DB_${configService.get<string>('APP_ENV')}_PORT`),
    username: configService.get<string>(`DB_${configService.get<string>('APP_ENV')}_USERNAME`),
    password: configService.get<string>(`DB_${configService.get<string>('APP_ENV')}_PASSWORD`),
    database: configService.get<string>(`DB_${configService.get<string>('APP_ENV')}_NAME`),
    entities: [], 
    migrations: [],
    autoLoadEntities: true,
    synchronize: false 
});

/**
 * SETUP MIGRATION CONFIG & DATASOURCE
 **/

dotenvConfig({ path: '.env' });
const migrationConfig = {
    type: 'postgres',
    host: `${process.env.DATABASE_HOST}`,
    port: `${process.env.DATABASE_PORT}`,
    username: `${process.env.DATABASE_USERNAME}`,
    password: `${process.env.DATABASE_PASSWORD}`,
    database: `${process.env.DATABASE_NAME}`,
    entities: ["dist/**/*.entity{.ts,.js}"],
    migrations: ["dist/migrations/*{.ts,.js}"],
    autoLoadEntities: true,
    synchronize: false,
}

export const connectionSource = new DataSource(migrationConfig as DataSourceOptions);