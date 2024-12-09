import { Module } from '@nestjs/common';
import { CategoryResolver } from './category.resolver';
import { CategoryService } from './category.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryData, CategoryDataSchema } from './schema/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CategoryData.name, schema: CategoryDataSchema }]),
  ],
  providers: [CategoryResolver, CategoryService]
})
export class CategoryModule {}
