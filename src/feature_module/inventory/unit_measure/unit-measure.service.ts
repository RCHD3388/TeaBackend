import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UnitMeasure } from "./unit-measure.schema";
import { CreateUnitMeasureInput } from "./dto/create-unit-measure.input";
import { UpdateUnitMeasureInput } from "./dto/update-unit-measure.input";
@Injectable()
export class UnitMeasureService {
    constructor(@InjectModel(UnitMeasure.name) private readonly unitMeasureModel: Model<UnitMeasure>) { }

    async findAll(): Promise<UnitMeasure[]> {
        return this.unitMeasureModel.find().exec();
    }

    async create(createUnitMeasureInput: CreateUnitMeasureInput): Promise<UnitMeasure> {
        const unitMeasure = await this.unitMeasureModel.findOne({ name: createUnitMeasureInput.name }).exec();
        if (unitMeasure) {
            throw new Error(`UnitMeasure with name "${createUnitMeasureInput.name}" already exists`);
        }
        const newUnitMeasure = new this.unitMeasureModel(createUnitMeasureInput);
        return newUnitMeasure.save();
    }
    async findById(id: string): Promise<UnitMeasure> {
        const unitMeasure = await this.unitMeasureModel.findById(id).exec();
        if (!unitMeasure) {
            throw new Error(`UnitMeasure with ID "${id}" not found`);
        }
        return unitMeasure;
    }
    async update(id: string, data: UpdateUnitMeasureInput): Promise<UnitMeasure> {
        const updatedUnitMeasure = await this.unitMeasureModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!updatedUnitMeasure) {
            throw new Error(`UnitMeasure with ID "${id}" not found`);
        }
        return updatedUnitMeasure;
    }   
}