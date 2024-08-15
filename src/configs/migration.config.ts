import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });
const migrationConfig = {
    type: 'postgres',
    host: `${process.env.DB_DEV_HOST}`,
    port: `${process.env.DB_DEV_PORT}`,
    username: `${process.env.DB_DEV_USERNAME}`,
    password: `${process.env.DB_DEV_PASSWORD}`,
    database: `${process.env.DB_DEV_NAME}`,
    entities: ["dist/**/*.entity{.ts,.js}"],
    migrations: ["migrations/*{.ts,.js}"],
    autoLoadEntities: true,
    synchronize: false,
}

export const connectionSource = new DataSource(migrationConfig as DataSourceOptions);