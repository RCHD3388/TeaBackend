import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UnitMeasure } from "./unit-measure.schema";
import { CreateUnitMeasureInput } from "./dto/create-unit-measure.input";

@Injectable()
export class UnitMeasureService {
    constructor(@InjectModel(UnitMeasure.name) private readonly unitMeasureModel: Model<UnitMeasure>) { }

    async findAll(): Promise<UnitMeasure[]> {
        return this.unitMeasureModel.find().exec();
    }

    async create(createUnitMeasureInput: CreateUnitMeasureInput): Promise<UnitMeasure> {
        const newUnitMeasure = new this.unitMeasureModel({ ...createUnitMeasureInput });
        return newUnitMeasure.save();
    }
}