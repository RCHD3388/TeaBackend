import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, Merk, Sku, UnitMeasure } from '../schema/inventory.schema';
import { CreateMaterialInput, UpdateMaterialInput } from '../types/material.types';
import { CreateSkuInput, UpdateSkuInput } from '../types/inventory_category.types';
import { CategoryData, CategoryType } from 'src/feature_module/category/schema/category.schema';

@Injectable()
export class ToolSkuService {
  constructor(
    @InjectModel(Sku.name) private skuModel: Model<Sku>,
    @InjectModel(Merk.name) private merkModel: Model<Merk>,
    @InjectModel(CategoryData.name) private categoryDataModel: Model<CategoryData>,
  ) { }

  async findAll(): Promise<Sku[]> {
    return this.skuModel.find().populate(['merk', 'item_category']).exec();
  }

  async findOne(id: string): Promise<Sku> {
    let sku = await this.skuModel.findById(id).populate(['merk', 'item_category']).exec();
    if (!sku) throw new NotFoundException('Sku tidak ditemukan');
    return sku;
  }

  async create(CreateSkuInput: CreateSkuInput): Promise<Sku> {
    const { name, description, merk, item_category } = CreateSkuInput;

    const existingSku = await this.skuModel.findOne({ name }).exec();
    if (existingSku) throw new BadRequestException('Sku sudah ada');

    let targetMerk = await this.merkModel.findById(merk).exec();
    if (!targetMerk) throw new NotFoundException(`Merk tidak ditemukan`);

    let targetItemCategory = await this.categoryDataModel.findOne({_id: item_category, type: CategoryType.ITEM}).exec();
    if (!targetItemCategory) throw new NotFoundException(`Kategori item tidak ditemukan`);

    const newSku = new this.skuModel(CreateSkuInput);
    return newSku.save();
  }

  async update(id: string, updateSkuInput: UpdateSkuInput): Promise<Sku> {
    const { name, description, merk, item_category } = updateSkuInput;

    let targetSku = await this.skuModel.findById(id).exec();

    // check if merk exist
    if (merk) {
      let targetMerk = await this.merkModel.findById(merk).exec();
      if (!targetMerk) throw new NotFoundException(`Merk tidak ditemukan`);
    }

    // check if item category exist
    if (item_category) {
      let targetItemCategory = await this.categoryDataModel.findOne({_id: item_category, type: CategoryType.ITEM}).exec();
      if (!targetItemCategory) throw new NotFoundException(`Kategori item tidak ditemukan`);
    }

    targetSku.name = name ? name : targetSku.name;
    targetSku.description = description ? description : targetSku.description;
    targetSku.merk = merk ? merk : targetSku.merk;
    targetSku.item_category = item_category ? item_category : targetSku.item_category;  

    return targetSku.save();
  }
}
