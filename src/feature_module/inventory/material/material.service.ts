import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material } from './material.schema';
import { CreateMaterialInput } from './dto/create-material.input';

@Injectable()
export class MaterialService {
    constructor(
        @InjectModel('Material') private readonly materialModel: Model<any>,
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
        const material = new this.materialModel(createMaterialInput);
        return material.save();
    }
}