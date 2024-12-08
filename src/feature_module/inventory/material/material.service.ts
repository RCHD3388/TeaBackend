import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material } from './material.schema';
import { CreateMaterialInput } from './dto/create-material.input';
import { Brand } from '../brand/brand.schema';
import { UnitMeasure } from '../unit_measure/unit-measure.schema';

@Injectable()
export class MaterialService {
    constructor(
        @InjectModel('Material') private readonly materialModel: Model<Material>,
        @InjectModel('UnitMeasure') private readonly unitMeasureModel: Model<UnitMeasure>,
        @InjectModel('Brand') private readonly brandModel: Model<Brand>,
    ) {}

    async findAll(): Promise<any[]> {
        return this.materialModel.find().exec();
    }
    async findById(id: string): Promise<any> {
        const material = await this.materialModel.findById(id).exec();
        if (!material) {
            throw new NotFoundException(`Material with ID "${id}" not found`);
        }
        return material;
    }

    async create(createMaterialInput: CreateMaterialInput): Promise<any> {
        const unitMeasure = await this.unitMeasureModel.findById(createMaterialInput.unit_measure).exec();
        const Brand = await this.unitMeasureModel.findById(createMaterialInput.brand).exec();
        if (!unitMeasure) {
            throw new NotFoundException(`UnitMeasure with ID "${createMaterialInput.unit_measure}" not found`);
        }
        if (!Brand) {
            throw new NotFoundException(`Brand with ID "${createMaterialInput.brand}" not found`);
        }
        const material = new this.materialModel(createMaterialInput);
        return material.save();
    } 
}