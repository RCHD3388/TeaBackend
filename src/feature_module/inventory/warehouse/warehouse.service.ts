import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Warehouse } from "./warehouse.schema";
import { CreateWarehouseInput } from "./dto/create-warehouse.input";
import { UpdateWarehouseInput } from "./dto/update-warehouse.input";
@Injectable()
export class WarehouseService {
    constructor(@InjectModel(Warehouse.name) private readonly warehouseModel: Model<Warehouse>) { }

    async findAll(): Promise<Warehouse[]> {
        return await this.warehouseModel.find({});
    }

    async findById(id: string): Promise<Warehouse> {
        const warehouse = await this.warehouseModel.findById(id);        
        if (!warehouse) {
            throw new Error(`Warehouse with ID "${id}" not found`);
        }
        return warehouse;
    }

    async create(createWarehouseInput: CreateWarehouseInput): Promise<Warehouse> {
        const newWarehouse = new this.warehouseModel({ ...createWarehouseInput });
        return newWarehouse.save();
    }
    async update(id: string, warehouse: UpdateWarehouseInput): Promise<Warehouse> {
        const updatedWarehouse = await this.warehouseModel.findByIdAndUpdate(id, warehouse, { new: true });
        if (!updatedWarehouse) {
            throw new Error(`Warehouse with ID "${id}" not found`);
        }
        return updatedWarehouse;
    }
    async activate(id: string): Promise<Warehouse> {
        return await this.warehouseModel.findByIdAndUpdate(id, { isActive: true }, { new: true });
    }
    async deactivate(id: string): Promise<Warehouse> {
        return await this.warehouseModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
    }
    
}
