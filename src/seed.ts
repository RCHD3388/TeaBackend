import { NestFactory } from '@nestjs/core';
import { DatabaseModule } from './core/database/database.module';
import { SeederService } from './core/database/seeder.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(DatabaseModule);
  const seederService = app.get(SeederService);

  await seederService.seed();

  await app.close(); 
}

seed().catch((err) => {
  console.error('Seeding failed!', err);
  process.exit(1); 
});
