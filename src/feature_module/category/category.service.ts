import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryData, CategoryType, CetegoryStatusType } from './schema/category.schema';
import { CategoryFilter, CreateCategoryDto, UpdateCategoryInput } from './types/category.types';
import { FilterInput } from '../types/global_input_types.types';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(CategoryData.name) private categoryModel: Model<CategoryData>,
  ) { }

  private async doesCategoryExist(name: string, id: string | null = null): Promise<boolean> {
    const filter: any = { name };
    if (id) { filter._id = { $ne: id }; }
    const existingData = await this.categoryModel.findOne(filter).exec();
    if (existingData) return true
    return false
  }

  async findAll(categoryFilter: CategoryFilter, filter?: FilterInput): Promise<CategoryData[]> {
    let category_filter: any = {}
    if (categoryFilter?.filter) {
      category_filter.type = { $in: categoryFilter.filter }
    }
      
    if(!filter?.status){
      category_filter.status = CetegoryStatusType.ACTIVE
    }

    return this.categoryModel.find({...category_filter}).exec();
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryData> {
    let { name } = createCategoryDto;
    if (await this.doesCategoryExist(name) == true) throw new BadRequestException(`Kategori dengan nama ${name} sudah ada`);
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async update(id: string, updateCategoryInput: UpdateCategoryInput): Promise<CategoryData> {
    if (await this.doesCategoryExist(updateCategoryInput.name, id)) {
      throw new BadRequestException(`Kategori dengan nama ${updateCategoryInput.name} sudah ada`);
    }
    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      { $set: updateCategoryInput },
      { new: true },
    ).exec();

    if (!updatedCategory) {
      throw new NotFoundException('Category not found');
    }

    return updatedCategory;
  }

  async delete(id: string): Promise<CategoryData> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const deletedCategory = await this.categoryModel.findByIdAndDelete(id).exec();
    return deletedCategory;
  }
}
