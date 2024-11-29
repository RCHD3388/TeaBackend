import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StockKeepingUnit } from './stock-keeping-unit.schema';
import { CreateStockKeepingUnitInput } from './dto/create-stock-keeping-unit.input';
import { Brand } from '../brand/brand.schema';
@Injectable()
export class StockKeepingUnitService {
    constructor(
        @InjectModel(StockKeepingUnit.name)
        private readonly stockKeepingUnitModel: Model<StockKeepingUnit>,
        @InjectModel(Brand.name)
        private readonly brandModel: Model<Brand>,
    ) {}

    async findAll(): Promise<StockKeepingUnit[]> {
        return this.stockKeepingUnitModel.find().exec();
    }

    async findById(id: string): Promise<StockKeepingUnit> {
        const sku = await this.stockKeepingUnitModel.findById(id).exec();
        if (!sku) {
            throw new NotFoundException(`StockKeepingUnit with ID "${id}" not found`);
        }
        return sku;
    }
    
    async create(data: CreateStockKeepingUnitInput): Promise<StockKeepingUnit> {
        const brand = await this.brandModel.findById(data.brand).exec();
        if (!brand) {
            throw new NotFoundException(`Brand with ID "${data.brand}" not found`);
        }

        const sku = new this.stockKeepingUnitModel({
            ...data,
            brand: brand._id,
        });
        return sku.save();
    }
}