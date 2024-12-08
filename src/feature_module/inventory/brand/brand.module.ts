import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from './brand.schema';
import { BrandService } from './brand.service';
import { BrandResolver } from './brand.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
  ],
  providers: [BrandService, BrandResolver],
  exports: [
    BrandService,
    MongooseModule, // Export MongooseModule to make the schema accessible
  ],
})
export class BrandModule {}

