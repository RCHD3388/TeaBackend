import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Brand } from "./brand.schema";
import { CreateBrandInput } from "./dto/create-brand.input";
@Injectable()
export class BrandService {
    constructor(@InjectModel(Brand.name) private readonly brandModel: Model<Brand>) {}

    async findAll(): Promise<Brand[]> {
        return await this.brandModel.find();
    }
    async findById(id: string): Promise<Brand> {
        const brand = await this.brandModel.findById(id);
        if (!brand) {
            throw new Error(`Brand with ID "${id}" not found`);
        }
        return brand;
    }
    async create(createBrandInput: CreateBrandInput): Promise<Brand> {
        const newBrand = new this.brandModel({ ...createBrandInput });
        return newBrand.save();
      }
      
    async update(id: string, brand: Brand): Promise<Brand> {
        const updatedBrand = await this.brandModel.findByIdAndUpdate(id, brand, { new: true });
        if (!updatedBrand) {
            throw new Error(`Brand with ID "${id}" not found`);
        }
        return updatedBrand;
    }
    async delete(id: string): Promise<Brand> {
        return await this.brandModel.findByIdAndDelete(id);
    }
}