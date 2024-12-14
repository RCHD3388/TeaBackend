import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, Merk, Sku, Tool } from './schema/inventory.schema';
import { CreateInventoryCategoryInput, UpdateInventoryCategoryInput } from './types/inventory_category.types';

@Injectable()
export class MerkService {
  constructor(
    @InjectModel(Merk.name) private merkModel: Model<Merk>,
    @InjectModel(Material.name) private materialModel: Model<Material>,
    @InjectModel(Sku.name) private skuModel: Model<Sku>,
  ) { }

  private async doesMerkExist(name: string, id: string | null = null): Promise<boolean> {
    const filter: any = { name };
    if (id) { filter._id = { $ne: id }; }
    const existingData = await this.merkModel.findOne(filter).exec();
    if (existingData) return true
    return false
  }

  async findAll(): Promise<Merk[]> {
    return await this.merkModel.find().exec();
  }

  async findOne(id: string): Promise<Merk> {
    const merk = await this.merkModel.findById(id).exec();
    if (!merk) {
      throw new NotFoundException(`Merk tidak ditemukan`);
    }
    return merk;
  }

  async create(createMerkInput: CreateInventoryCategoryInput): Promise<Merk> {
    let { name } = createMerkInput;

    // check if merk already exist
    if (await this.doesMerkExist(name) == true) throw new BadRequestException(`Merk dengan nama ${name} sudah ada`);
    const createdMerk = new this.merkModel(createMerkInput);
    return createdMerk.save();
  }

  async update(id: string, updateMerkInput: UpdateInventoryCategoryInput): Promise<Merk> {
    if (updateMerkInput.name) {
      if (await this.doesMerkExist(updateMerkInput.name, id)) {
        throw new BadRequestException(`Merk dengan nama ${updateMerkInput.name} sudah ada`);
      }
    }
    const updatedMerk = await this.merkModel.findByIdAndUpdate(
      id,
      { $set: updateMerkInput },
      { new: true },
    ).exec();

    if (!updatedMerk) {
      throw new NotFoundException('Merk not found');
    }

    return updatedMerk;
  }

  async delete(id: string): Promise<Merk> {
    const merk = await this.merkModel.findById(id).exec();
    if (!merk) {
      throw new NotFoundException(`Merk with ID ${id} not found`);
    }

    let materialConstraint = await this.materialModel.findOne({ merk: id }).exec();
    let skuConstraint = await this.skuModel.findOne({ merk: id }).exec();

    // check if already used
    if (materialConstraint || skuConstraint) {
      throw new BadRequestException(`Merk tidak dapat dihapus, karena sudah pernah digunakan`)
    }

    const deletedMerk = await this.merkModel.findByIdAndDelete(id).exec();
    return deletedMerk;
  }
}
