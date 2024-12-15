import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, startSession } from 'mongoose';
import { CategoryData, TransactionCategory } from 'src/feature_module/category/schema/category.schema';
import { Warehouse } from '../schema/warehouse.schema';
import { MaterialTransaction, ToolTransaction } from '../schema/inventory_trans.schema';
import { AddInventoryMaterialInput, CreateMaterialTransactionInput, CreateToolTransactionInput } from '../types/inventory_trans.types';
import { Tool } from '../schema/inventory.schema';
import { MaterialTransactionService } from './material_transaction.service';
import { ToolTransactionService } from './tool_transaction.service';

@Injectable()
export class MasterTransactionService {
  constructor(
    private readonly materialTransactionService: MaterialTransactionService,
    private readonly toolTransactionService: ToolTransactionService,
    @InjectModel(CategoryData.name) private categoryDataModel: Model<CategoryData>,
  ) { }

  async addNewMaterial(addInventoryMaterialInput: AddInventoryMaterialInput): Promise<Boolean> {
    let { warehouse, materials } = addInventoryMaterialInput
    let input: CreateMaterialTransactionInput;

    let targetCategoryData = await this.categoryDataModel.findOne({ id: "ADD" }).exec()

    for (let material of materials) {
      input = {
        material: material.material,
        qty: material.quantity,
        warehouse_to: warehouse,
        transaction_category: targetCategoryData._id
      }
      await this.materialTransactionService.create(input)
    }

    return true
  }
}
