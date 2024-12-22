import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, startSession } from 'mongoose';
import { TransactionCategory } from 'src/feature_module/category/schema/category.schema';
import { Warehouse, WarehouseStatus } from '../schema/warehouse.schema';
import { MaterialTransaction } from '../schema/inventory_trans.schema';
import { Material } from '../schema/inventory.schema';
import { CreateMaterialTransactionInput } from '../types/inventory_trans.types';

@Injectable()
export class MaterialTransactionService {
  constructor(
    @InjectModel(Material.name) private materialModel: Model<Material>,
    @InjectModel(MaterialTransaction.name) private materialTransactionModel: Model<MaterialTransaction>,
    @InjectModel(TransactionCategory.name) private transactionCategoryModel: Model<TransactionCategory>,
    @InjectModel(Warehouse.name) private warehouseModel: Model<Warehouse>,
  ) { }

  async getRemainItems(warehouse: string, session?: ClientSession): Promise<MaterialTransaction[]> {
    let targetWarehouse = await this.warehouseModel.findById(warehouse).session(session || null).exec()
    if (!targetWarehouse) throw new NotFoundException('Warehouse tidak ditemukan')

    let remainsData = await this.materialTransactionModel.aggregate([
      { $match: { warehouse, remain: { $gt: 0 } } },
      { $sort: { date: -1 } },   // descending date
      {
        $group: {
          _id: "$material",                          // Kelompokkan berdasarkan item
          latestTransaction: { $first: "$$ROOT" } // Ambil data transaksi terbaru untuk setiap item
        }
      },
      { $replaceRoot: { newRoot: "$latestTransaction" } } // Ganti root dengan data transaksi terbaru
    ]).session(session || null).exec();

    
    const populatedData = await this.materialTransactionModel.populate(remainsData, {
      path: 'material', // Populate material
      populate: [
        { path: 'merk', model: 'Merk' },
        { path: 'unit_measure', model: 'UnitMeasure' },
        { path: 'minimum_unit_measure', model: 'UnitMeasure' },
        { path: 'item_category', model: 'CategoryData' },
      ]
    });
    
    
    return populatedData
  }

  private add_getNewRemainAndPrice(latestMaterialTransaction: MaterialTransaction[], qty: number, price: number) {
    let newRemainItems = latestMaterialTransaction.length <= 0 ? qty : latestMaterialTransaction[0].remain + qty;
    let newPrice = 0;
    if (latestMaterialTransaction.length <= 0) {
      newPrice = price ? price : 0
    } else {
      let latestRemain = latestMaterialTransaction[0].remain;
      let latestPrice = latestMaterialTransaction[0].price;
      newPrice = ((latestPrice * latestRemain) + (price * qty)) / newRemainItems;
    }

    return { newRemainItems, newPrice }
  }

  private sub_getNewRemainAndPrice(latestMaterialTransaction: MaterialTransaction[], qty: number, price: number) {
    let newRemainItems = latestMaterialTransaction[0].remain - qty;
    let newPrice = latestMaterialTransaction[0].price;

    return { newRemainItems, newPrice }
  }

  async create(
    createMaterialTransactionInput: CreateMaterialTransactionInput,
    session: ClientSession
  ): Promise<MaterialTransaction[]> {
    let { transaction_category, warehouse_from, warehouse_to, materials } = createMaterialTransactionInput
    try {
      // START TRANSACTION
      if(warehouse_from && warehouse_to && warehouse_from == warehouse_to) throw new BadRequestException('Warehouse sumber dan tujuan tidak boleh sama');

      // check transaction category exist
      let targetTransactionCategory = await this.transactionCategoryModel.findOne({ id: transaction_category }).session(session);
      if (!targetTransactionCategory) throw new NotFoundException(`Kategori transaksi tidak ditemukan`);

      // check target warehouse & source warehouse
      let target_warehouse = await this.warehouseModel.findOne({_id: warehouse_to, status: WarehouseStatus.ACTIVE}).session(session)
      let source_warehouse = await this.warehouseModel.findOne({_id: warehouse_from}).session(session)
      if (targetTransactionCategory.id == "PUR" || targetTransactionCategory.id == "TRF" || targetTransactionCategory.id == "ADD") {
        if (!target_warehouse) throw new NotFoundException(`Warehouse tujuan tidak ditemukan`);
      }
      if (targetTransactionCategory.id == "USE" || targetTransactionCategory.id == "TRF") {
        if (!source_warehouse) throw new NotFoundException(`Warehouse sumber tidak ditemukan`);
      }

      // ======================= PROSES START =======================
      let listOfNewTransaction: MaterialTransaction[] = [];

      for (let curMaterial of materials) {
        // GET MATERIAL DETAIL
        let { material, qty, price } = curMaterial

        // QUANTITY CHECK
        if (qty <= 0) throw new BadRequestException('Jumlah material harus lebih besar dari 0');

        // CHECK MATERIAL EXIST

        let targetMaterial = await this.materialModel.findById(material).session(session);
        if (!targetMaterial) throw new NotFoundException(`Material tidak ditemukan`);

        // CREATE TRANSACTION CODE AND DATE
        let newTransCode = `${targetTransactionCategory.id}${targetTransactionCategory.counter + 1}`
        let date = new Date();

        // latest material transaction for warehouse_from with material_id
        const warehouseFrom_latestMaterialTransaction = await this.materialTransactionModel.find({ material: material, warehouse: warehouse_from })
          .sort({ date: -1 })
          .limit(1)
          .session(session)

        // used material and transfer out from warehouse_from
        if (targetTransactionCategory.id == "USE" || targetTransactionCategory.id == "TRF") {
          // process transfer
          // CHECK REMAIN MATERIAL FROM WAREHOUSE_FROM
          if (warehouseFrom_latestMaterialTransaction.length <= 0 || warehouseFrom_latestMaterialTransaction[0].remain < qty) {
            throw new BadRequestException(`Material tidak cukup di warehouse sumber`);
          }
          let { newRemainItems, newPrice } = this.sub_getNewRemainAndPrice(warehouseFrom_latestMaterialTransaction, qty, price)
          let newOutMaterialTransaction = new this.materialTransactionModel({
            material: material,
            in: 0,
            out: 0,
            remain: newRemainItems,
            price: newPrice,
            warehouse: warehouse_from,
            transaction_code: newTransCode,
            transaction_category: transaction_category,
            date,
          })

          await newOutMaterialTransaction.save({ session });
          listOfNewTransaction.push(newOutMaterialTransaction);
        }

        // receive transfer tools to warehouse_to
        if (targetTransactionCategory.id == "TRF" || targetTransactionCategory.id == "PUR" || targetTransactionCategory.id == "ADD") {
          // latest material transaction for warehouse_to with material_id
          const warehouseTo_latestMaterialTransaction = await this.materialTransactionModel.find({ material: material, warehouse: warehouse_to })
            .sort({ date: -1 })
            .limit(1)
            .session(session)

          // process transfer
          let actualPrice = price;
          // GET PRICE IF TRANSCATEGORY = TRF
          if (targetTransactionCategory.id == "TRF") {
            actualPrice = warehouseFrom_latestMaterialTransaction[0].price;
          }
          
          let { newRemainItems, newPrice } = this.add_getNewRemainAndPrice(warehouseTo_latestMaterialTransaction, qty, actualPrice)
          let newInMaterialTransaction = new this.materialTransactionModel({
            material: material,
            in: qty,
            out: 0,
            remain: newRemainItems,
            price: newPrice,
            warehouse: warehouse_to,
            transaction_code: newTransCode,
            transaction_category: transaction_category,
            date,
          })
          await newInMaterialTransaction.save({ session });
          listOfNewTransaction.push(newInMaterialTransaction);
        }

        // udpate transaction counter
        targetTransactionCategory.counter = targetTransactionCategory.counter + 1;
        await targetTransactionCategory.save({ session });
      }

      // ======================= PROSES END =======================
      
      return listOfNewTransaction
    } catch (error) {
      throw error;
    } 
  }
}
