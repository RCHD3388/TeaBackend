import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Material, MaterialStatus, Merk, Sku, Tool, UnitMeasure } from '../schema/inventory.schema';
import { CreateMaterialInput, UpdateMaterialInput } from '../types/material.types';
import { CreateSkuInput, UpdateSkuInput } from '../types/inventory_category.types';
import { CategoryData, CategoryType } from 'src/feature_module/category/schema/category.schema';
import { CreateToolInput, UpdateToolInput } from '../types/tool.types';
import { stat } from 'fs';

@Injectable()
export class ToolService {
  constructor(
    @InjectModel(Tool.name) private toolModel: Model<Tool>,
    @InjectModel(Sku.name) private skuModel: Model<Sku>,
    @InjectModel(CategoryData.name) private categoryDataModel: Model<CategoryData>,
  ) { }

  async generateNewId(): Promise<string> {
    let currentDateToString: string;
    let newId: string;
    do {
      currentDateToString = Date.now().toString()
      newId = `TL${currentDateToString}`;
    } while (await this.toolModel.exists({ id: newId }))
    return newId;
  }

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

  async findByIds(ids: string[]): Promise<Tool[]> {
    return this.toolModel.find({ _id: { $in: ids } }).populate(["sku", "status", {
      path: 'sku',
      populate: {path: "merk", model: "Merk"}
    }]).exec();
  }

  async create(createToolInput: CreateToolInput, session: ClientSession): Promise<string> {
    const { sku, status } = createToolInput;

    const targetSku = await this.skuModel.findOne({_id: sku, status: MaterialStatus.ACTIVE}).exec();
    if (!targetSku) throw new NotFoundException(`Sku aktif tidak ditemukan`);

    let targetStatus = await this.categoryDataModel.findOne({_id: status, type: CategoryType.TOOL_STATUS}).exec();
    if (!targetStatus) throw new NotFoundException(`Status tidak ditemukan`);

    let newId = await this.generateNewId();

    const newTool = new this.toolModel({ ...createToolInput, id: newId });
    await newTool.save({ session });

    return newTool._id;
  }

  async update(id: string, updateToolInput: UpdateToolInput): Promise<Tool> {
    const { sku, status } = updateToolInput;

    if (sku) {
      const targetSku = await this.skuModel.findOne({_id: sku, status: MaterialStatus.ACTIVE}).exec();
      if (!targetSku) throw new NotFoundException(`Sku tidak ditemukan`);
    }

    if (status) {
      let targetStatus = await this.categoryDataModel.findOne({_id: status, type: CategoryType.TOOL_STATUS}).exec();
      if (!targetStatus) throw new NotFoundException(`Status tidak ditemukan`);
    }

    return await this.toolModel.findByIdAndUpdate(id, updateToolInput);
  }

  
  async remove(id: string): Promise<Tool> {
    let tool = await this.toolModel.findByIdAndDelete(id).exec();
    if (!tool) throw new NotFoundException('Tool tidak ditemukan');
    return tool;
  }
}
