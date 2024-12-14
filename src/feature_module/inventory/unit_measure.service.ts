import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, UnitMeasure } from './schema/inventory.schema';
import { CreateInventoryCategoryInput, UpdateInventoryCategoryInput } from './types/inventory_category.types';

@Injectable()
export class UnitMeasureService {
  constructor(
    @InjectModel(UnitMeasure.name) private unitMeasureModel: Model<UnitMeasure>,
    @InjectModel(Material.name) private materialModel: Model<Material>,
  ) { }

  private async doesUnitMeasureExist(name: string, id: string | null = null): Promise<boolean> {
    const filter: any = { name };
    if (id) { filter._id = { $ne: id }; }
    const existingData = await this.unitMeasureModel.findOne(filter).exec();
    if (existingData) return true
    return false
  }

  async findAll(): Promise<UnitMeasure[]> {
    return await this.unitMeasureModel.find().exec();
  }

  async findOne(id: string): Promise<UnitMeasure> {
    const unitMeasure = await this.unitMeasureModel.findById(id).exec();
    if (!unitMeasure) {
      throw new NotFoundException(`Satuan unit tidak ditemukan`);
    }
    return unitMeasure;
  }

  async create(createUnitMeasureInput: CreateInventoryCategoryInput): Promise<UnitMeasure> {
    let { name } = createUnitMeasureInput;

    // check if unit measure already exist
    if (await this.doesUnitMeasureExist(name) == true) throw new BadRequestException(`Satuan unit dengan nama ${name} sudah ada`);
    const createdUMeasure = new this.unitMeasureModel(createUnitMeasureInput);
    return createdUMeasure.save();
  }

  async update(id: string, updateUnitMeasureInput: UpdateInventoryCategoryInput): Promise<UnitMeasure> {
    if (updateUnitMeasureInput.name) {
      if (await this.doesUnitMeasureExist(updateUnitMeasureInput.name, id)) {
        throw new BadRequestException(`Satuan unit dengan nama ${updateUnitMeasureInput.name} sudah ada`);
      }
    }
    const updatedUMeasure = await this.unitMeasureModel.findByIdAndUpdate(
      id,
      { $set: updateUnitMeasureInput },
      { new: true },
    ).exec();

    if (!updatedUMeasure) {
      throw new NotFoundException('Satuan unit not found');
    }

    return updatedUMeasure;
  }

  async delete(id: string): Promise<UnitMeasure> {
    const unitMeasure = await this.unitMeasureModel.findById(id).exec();
    if (!unitMeasure) {
      throw new NotFoundException(`Satuan unit with ID ${id} not found`);
    }

    // check if already used
    let materialConstraint = await this.materialModel.findOne({
      $or: [
        { unit_measure: id },
        { minimum_unit_measure: id }
      ]
    }).exec()
    if (materialConstraint) throw new BadRequestException(`Satuan unit tidak dapat dihapus, karena sudah pernah digunakan`)

    const deletedUnitMeasure = await this.unitMeasureModel.findByIdAndDelete(id).exec();
    return deletedUnitMeasure;
  }
}
