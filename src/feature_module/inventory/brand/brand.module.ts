import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from './brand.schema';
import { BrandService } from './brand.service';
import { BrandResolver } from './brand.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]), // Register the schema
  ],
  providers: [BrandService, BrandResolver], // Service and resolver
  exports: [BrandService], // Export the service for use in other modules if needed
})
export class BrandModule {}
