import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get<string>(`DB_${configService.get<string>('APP_ENV')}_HOST`),
    port: configService.get<number>(`DB_${configService.get<string>('APP_ENV')}_PORT`),
    username: configService.get<string>(`DB_${configService.get<string>('APP_ENV')}_USERNAME`),
    password: configService.get<string>(`DB_${configService.get<string>('APP_ENV')}_PASSWORD`),
    database: configService.get<string>(`DB_${configService.get<string>('APP_ENV')}_NAME`),
    entities: [], 
    synchronize: true 
});
