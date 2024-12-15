import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, Merk, Sku, Tool, UnitMeasure } from '../schema/inventory.schema';
import { CreateMaterialInput, UpdateMaterialInput } from '../types/material.types';
import { CreateSkuInput, UpdateSkuInput } from '../types/inventory_category.types';
import { CategoryData } from 'src/feature_module/category/schema/category.schema';
import { CreateToolInput, UpdateToolInput } from '../types/tool.types';
import { stat } from 'fs';

@Injectable()
export class ToolService {
  constructor(
    @InjectModel(Tool.name) private toolModel: Model<Tool>,
    @InjectModel(Sku.name) private skuModel: Model<Sku>,
    @InjectModel(CategoryData.name) private categoryDataModel: Model<CategoryData>,
  ) { }

  async findAll(sku?: string): Promise<Tool[]> {
    let filter = {}
    if (sku) {
      filter = { sku }
    }
    return await this.toolModel.find(filter).populate(["sku", "status"]);
  }

  async findOne(id: string): Promise<Tool> {
    let tool = await this.toolModel.findById(id).populate(["sku", "status"]).exec();
    if (!tool) throw new NotFoundException('Tool tidak ditemukan');
    return tool;
  }

  async create(createToolInput: CreateToolInput) {
    const { sku, status } = createToolInput;

    const targetSku = await this.skuModel.findById(sku).exec();
    if (!targetSku) throw new NotFoundException(`Sku tidak ditemukan`);

    let targetStatus = await this.categoryDataModel.findById(status).exec();
    if (!targetStatus) throw new NotFoundException(`Status tidak ditemukan`);

    const newTool = new this.toolModel(createToolInput);
    await newTool.save();
  }

  async update(id: string, updateToolInput: UpdateToolInput) {
    const { sku, status } = updateToolInput;

    if(sku) {
      const targetSku = await this.skuModel.findById(sku).exec();
      if (!targetSku) throw new NotFoundException(`Sku tidak ditemukan`);
    }

    if(status) {
      let targetStatus = await this.categoryDataModel.findById(status).exec();
      if (!targetStatus) throw new NotFoundException(`Status tidak ditemukan`);      
    }

    await this.toolModel.findByIdAndUpdate(id, updateToolInput);
  }
}
