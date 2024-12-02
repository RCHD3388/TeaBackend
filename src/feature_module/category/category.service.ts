import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryData } from './schema/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(CategoryData.name) private categoryModel: Model<CategoryData>,
  ) { }
}
