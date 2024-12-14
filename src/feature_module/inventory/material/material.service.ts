import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, Merk, Sku, UnitMeasure } from '../schema/inventory.schema';
import { CreateMaterialInput, UpdateMaterialInput } from '../types/material.types';
import { CategoryData } from 'src/feature_module/category/schema/category.schema';

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel(Material.name) private materialModel: Model<Material>,
    @InjectModel(UnitMeasure.name) private unitMeasureModel: Model<UnitMeasure>,
    @InjectModel(Merk.name) private merkModel: Model<Merk>,
    @InjectModel(CategoryData.name) private categoryDataModel: Model<CategoryData>,
  ) { }

  async generateNewId(): Promise<string> {
    const lastMaterial = await this.materialModel.findOne().sort({ id: -1 }).exec();
    if (!lastMaterial) return 'MT0001'; // ID default jika tidak ada data sebelumnya

    const id = lastMaterial.id;
    const prefix = id.substring(0, 2);
    const numberPart = parseInt(id.substring(2));

    const newNumber = numberPart + 1;
    const newId = `${prefix}${newNumber.toString().padStart(4, '0')}`;

    return newId;
  }

  async findAll(): Promise<Material[]> {
    return this.materialModel.find().populate(["merk", "unit_measure", "minimum_unit_measure", "item_category"]).exec();
  }

  async findOne(id: string): Promise<Material> {
    let material = await this.materialModel.findById(id).populate(["merk", "unit_measure", "minimum_unit_measure", "item_category"]).exec();
    if (!material) throw new NotFoundException('Material not found');
    return material;
  }

  async create(createMaterialInput: CreateMaterialInput): Promise<Material> {
    const { merk, unit_measure, minimum_unit_measure, conversion, item_category } = createMaterialInput;
    if (conversion <= 0) throw new BadRequestException('Konversi harus lebih besar dari 0');

    // check merk exist
    let targetMerk = await this.merkModel.findById(merk).exec();
    if (!targetMerk) throw new NotFoundException(`Merk tidak ditemukan`);

    // check unit measure exist
    let targetUnitMeasure = await this.unitMeasureModel.findById(unit_measure).exec();
    if (!targetUnitMeasure) throw new NotFoundException(`Satuan unit tidak ditemukan`);

    // check minimum unit measure exist
    let targetMinimumUnitMeasure = await this.unitMeasureModel.findById(minimum_unit_measure).exec();
    if (!targetMinimumUnitMeasure) throw new NotFoundException(`Satuan unit terkecil tidak ditemukan`);

    // check item category exist
    let targetItemCategory = await this.categoryDataModel.findById(item_category).exec();
    if (!targetItemCategory) throw new NotFoundException(`Kategori item tidak ditemukan`);

    // check if already exist
    let targetMaterial = await this.materialModel.findOne({ merk: merk, unit_measure: unit_measure, minimum_unit_measure: minimum_unit_measure, conversion: conversion, item_category: item_category }).exec();
    if (targetMaterial) throw new BadRequestException(`Material dengan detail yang sama sudah ada`);

    let newId = await this.generateNewId();

    const newMaterial = new this.materialModel({ ...createMaterialInput, id: newId });
    return newMaterial.save();
  }

  async update(id: string, updateMaterialInput: UpdateMaterialInput): Promise<Material> {
    let { merk, unit_measure, minimum_unit_measure, conversion, item_category } = updateMaterialInput;

    // Ambil data material saat ini
    const currentMaterial = await this.materialModel.findById(id).exec();
    if (!currentMaterial) throw new NotFoundException(`Material dengan ID ${id} tidak ditemukan`);

    // check conversion
    if (conversion && conversion <= 0) throw new BadRequestException('Konversi harus lebih besar dari 0');

    // check merk exist
    if (merk) {
      let targetMerk = await this.merkModel.findById(merk).exec();
      if (!targetMerk) throw new NotFoundException(`Merk tidak ditemukan`);
    }

    // check unit measure exist
    if (unit_measure) {
      let targetUnitMeasure = await this.unitMeasureModel.findById(unit_measure).exec();
      if (!targetUnitMeasure) throw new NotFoundException(`Satuan unit tidak ditemukan`);
    }

    // check minimum unit measure exist
    if (minimum_unit_measure) {
      let targetMinimumUnitMeasure = await this.unitMeasureModel.findById(minimum_unit_measure).exec();
      if (!targetMinimumUnitMeasure) throw new NotFoundException(`Satuan unit terkecil tidak ditemukan`);
    }

    // check item category exist
    if (item_category) {
      let targetItemCategory = await this.categoryDataModel.findById(item_category).exec();
      if (!targetItemCategory) throw new NotFoundException(`Kategori item tidak ditemukan`);
    }

    // Tentukan kombinasi akhir atribut setelah update
    if (merk || unit_measure || minimum_unit_measure || conversion || item_category) {

      // Check material validity
      const existingMaterial = await this.materialModel.findOne({
        _id: { $ne: id }, // Exclude the current material being updated
        merk: merk || currentMaterial.merk,
        unit_measure: unit_measure || currentMaterial.unit_measure,
        minimum_unit_measure: minimum_unit_measure || currentMaterial.minimum_unit_measure,
        conversion: conversion ?? currentMaterial.conversion,
        item_category: item_category || currentMaterial.item_category
      }).exec();

      if (existingMaterial) {
        throw new BadRequestException('Material dengan detail yang sama sudah ada');
      }
    }

    const updatedMaterial = await this.materialModel.findByIdAndUpdate(
      id,
      { $set: updateMaterialInput },
      { new: true },
    ).exec();
    return updatedMaterial;
  }
}
