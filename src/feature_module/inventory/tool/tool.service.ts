import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tool } from './tool.schema';
import { StockKeepingUnit } from '../stock_keeping_unit/stock-keeping-unit.schema';
import { CreateToolInput } from './dto/create-tool.input';
import { CategoryData } from '../../category_data/category-data.schema';
@Injectable()
export class ToolService {
    constructor(
        @InjectModel(Tool.name)
        private readonly toolModel: Model<Tool>,
        @InjectModel(CategoryData.name)
        private readonly categoryModel: Model<CategoryData>,
        @InjectModel(StockKeepingUnit.name)
        private readonly stockKeepingUnitModel: Model<StockKeepingUnit>,
    ) {}

    async findAll(): Promise<Tool[]> {
        return this.toolModel.find().exec();
    }
    async findById(id: string): Promise<Tool> {
        const tool = await this.toolModel.findById(id).exec();
        if (!tool) {
            throw new NotFoundException(`Tool with ID "${id}" not found`);
        }
        return tool;
    }
    async findBySKU(sku: StockKeepingUnit): Promise<Tool[]> {
        const tools = await this.toolModel.find({ sku }).exec();
        if (!tools || tools.length === 0) {
            throw new NotFoundException(`No tools found with SKU "${sku}"`);
        }
        return tools;
    }
    async create(createToolInput: CreateToolInput): Promise<Tool> {
        const category = await this.categoryModel.findById(createToolInput.item_category).exec();
        const sku = await this.stockKeepingUnitModel.findById(createToolInput.stock_keeping_unit).exec();
        if (!category) {
            throw new NotFoundException(`Category with ID "${createToolInput.item_category}" not found`);
        }
        if (!sku) {
            throw new NotFoundException(`StockKeepingUnit with ID "${createToolInput.stock_keeping_unit}" not found`);
        }
        const tool = new this.toolModel(
            {
                ...createToolInput,
                item_category: category._id,
                stock_keeping_unit: sku._id,
            },
        );
        return tool.save();
    }

}