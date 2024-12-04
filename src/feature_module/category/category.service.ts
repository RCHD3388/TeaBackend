import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryData } from './schema/category.schema';
import { CreateCategoryDto, UpdateCategoryInput } from './types/category.types';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(CategoryData.name) private categoryModel: Model<CategoryData>,
  ) { }

  async findAll(): Promise<CategoryData[]> {
    return this.categoryModel.find();
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryData> {
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async update(id: string, updateCategoryInput: UpdateCategoryInput): Promise<CategoryData> {
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
    if (category.already_used) {
      throw new BadRequestException('This category has already been used and cannot be deleted');
    }

    const deletedCategory = await this.categoryModel.findByIdAndDelete(id).exec();
    return deletedCategory;
  }

  async updateAlreadyUsed(id: string, already_used: boolean): Promise<CategoryData> {
    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      { $set: {
        already_used: already_used
      } },
      { new: true },
    ).exec();

    if (!updatedCategory) {
      throw new NotFoundException('Category not found');
    }

    return updatedCategory;
  }
}
