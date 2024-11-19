import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';
import databaseConfig from '../../../common/configs/database.config';
import { CustomLoggerService } from '../../custom-logger/logger.service';

async function bootstrap() {
  const logger = new CustomLoggerService();

  try {
    const app = await NestFactory.createApplicationContext(SeederModule.register());
    const seeder = app.get(SeederService);
    
    await seeder.seed();
    logger.log('Seeding completed successfully');
    
    await app.close();
    process.exit(0);
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Seeding failed', error.stack);
    } else {
      logger.error('Seeding failed with unknown error', '');
    }
    process.exit(1);
  }
}

bootstrap();