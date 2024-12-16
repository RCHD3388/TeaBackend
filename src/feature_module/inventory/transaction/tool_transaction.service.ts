import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, startSession } from 'mongoose';
import { TransactionCategory } from 'src/feature_module/category/schema/category.schema';
import { Warehouse } from '../schema/warehouse.schema';
import { MaterialTransaction, ToolTransaction } from '../schema/inventory_trans.schema';
import { AddOnlyToolTransactionInput, CreateToolTransactionInput } from '../types/inventory_trans.types';
import { Tool } from '../schema/inventory.schema';
import { ToolService } from '../tool/tool.service';

@Injectable()
export class ToolTransactionService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Tool.name) private toolModel: Model<Tool>,
    @InjectModel(ToolTransaction.name) private toolTransactionModel: Model<ToolTransaction>,
    @InjectModel(TransactionCategory.name) private transactionCategoryModel: Model<TransactionCategory>,
    @InjectModel(Warehouse.name) private warehouseModel: Model<Warehouse>,
    private readonly toolService: ToolService
  ) { }

  async getRemainItems(warehouse: string): Promise<ToolTransaction[]> {
    let targetWarehouse = await this.warehouseModel.findById(warehouse).exec()
    if (!targetWarehouse) throw new NotFoundException('Warehouse tidak ditemukan')

    let remainsData = await this.toolTransactionModel.aggregate([
      { $match: { warehouse, in: 1 } },
      { $sort: { date: -1 } },   // descending date
      {
        $group: {
          _id: "$tool",                          // Kelompokkan berdasarkan item
          latestTransaction: { $first: "$$ROOT" } // Ambil data transaksi terbaru untuk setiap item
        }
      },
      { $replaceRoot: { newRoot: "$latestTransaction" } } // Ganti root dengan data transaksi terbaru
    ]);

    const populatedData = await this.toolTransactionModel.populate(remainsData, { path: 'tool' });

    return populatedData
  }
  async create(createToolTransactionInput: CreateToolTransactionInput): Promise<Boolean> {
    let { warehouse_to, warehouse_from, transaction_category, tool } = createToolTransactionInput
    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      // START TRANSACTION
      // check transaction category exist
      let targetTransactionCategory = await this.transactionCategoryModel.findOne({ id: transaction_category }).session(session);
      if (!targetTransactionCategory) throw new NotFoundException(`Kategori transaksi tidak ditemukan`);

      // check target warehouse
      let target_warehouse = await this.warehouseModel.findById(warehouse_to).session(session)
      let source_warehouse = await this.warehouseModel.findById(warehouse_from).session(session)

      if (targetTransactionCategory.id == "PUR" || targetTransactionCategory.id == "TRF" || targetTransactionCategory.id == "ADD") {
        if (!target_warehouse) throw new NotFoundException(`Warehouse tujuan tidak ditemukan`);
      }
      if (targetTransactionCategory.id == "USE" || targetTransactionCategory.id == "TRF") {
        if (!source_warehouse) throw new NotFoundException(`Warehouse sumber tidak ditemukan`);
      }

      // ======================= PROSES START =======================
      for (let curTool of tool) {

        // CHECK TOOL AVAILABILITY
        let targetTool = await this.toolModel.findById(curTool).session(session)
        if (!targetTool) throw new NotFoundException(`Alat tidak ditemukan`);

        // GENERATE NEW TRANS CODE AND DATE
        let newTransCode = `${targetTransactionCategory.id}${targetTransactionCategory.counter + 1}`
        let date = new Date();

        // check transaction history


        // used tools and transfer out from warehouse_from
        if (targetTransactionCategory.id == "USE" || targetTransactionCategory.id == "TRF") {
          const from_latestToolTransaction = await this.toolTransactionModel.find({ tool: tool, warehouse: warehouse_from })
            .sort({ date: -1 })
            .limit(1)
            .session(session)
          // CHECK TOOL EXIST
          if (from_latestToolTransaction.length <= 0 || from_latestToolTransaction[0].in == 0) {
            throw new BadRequestException(`Tool tidak ada di warehouse sumber`);
          }
          let newOutToolTransaction = new this.toolTransactionModel({
            tool: tool,
            date,
            in: 0,
            out: 1,
            warehouse: warehouse_from,
            transaction_code: newTransCode,
            transaction_category: transaction_category,
          })
          await newOutToolTransaction.save({ session });
        }

        // receive transfer tools to warehouse_to
        if (targetTransactionCategory.id == "TRF" || targetTransactionCategory.id == "PUR" || targetTransactionCategory.id == "ADD") {
          const to_latestToolTransaction = await this.toolTransactionModel.find({ tool: tool, warehouse: warehouse_to })
            .sort({ date: -1 })
            .limit(1)
            .session(session)

          // CHECK IF ALREADY EXIST
          if(to_latestToolTransaction.length > 0 && to_latestToolTransaction[0].in == 1) throw new BadRequestException(`Tool sudah ada di warehouse tujuan`);
          let newInToolTransaction = new this.toolTransactionModel({
            tool: tool,
            date,
            in: 1,
            out: 0,
            warehouse: warehouse_to,
            transaction_code: newTransCode,
            transaction_category: transaction_category,
          })

          await newInToolTransaction.save({ session });
        }

        // udpate transaction counter
        targetTransactionCategory.counter = targetTransactionCategory.counter + 1;
        await targetTransactionCategory.save({ session });
      }

      await session.commitTransaction();
      return true
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async addOnlyTool(addOnlyToolTransactionInput: AddOnlyToolTransactionInput): Promise<Boolean> {
    let { warehouse_to, tool, transaction_category } = addOnlyToolTransactionInput
    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      // START TRANSACTION
      // check transaction category exist
      let targetTransactionCategory = await this.transactionCategoryModel.findOne({ id: transaction_category }).session(session);
      if (!targetTransactionCategory) throw new NotFoundException(`Kategori transaksi tidak ditemukan`);

      // check target warehouse
      let target_warehouse = await this.warehouseModel.findById(warehouse_to).session(session)
      if (!target_warehouse) throw new NotFoundException(`Warehouse tujuan tidak ditemukan`);

      // ADD AND CREATE PROCESS
      for (let curTool of tool) {
        let newTransCode = `${targetTransactionCategory.id}${targetTransactionCategory.counter + 1}`
        let date = new Date();

        // CREATE NEW TOOL
        let targetTool = await this.toolService.create(curTool, session)

        // CREATE NEW TRANSACTION
        let newInToolTransaction = new this.toolTransactionModel({
          tool: targetTool,
          date,
          in: 1,
          out: 0,
          warehouse: warehouse_to,
          transaction_code: newTransCode,
          transaction_category: targetTransactionCategory._id,
        })

        await newInToolTransaction.save({ session });

        // UPDATE TRANSACTION COUNTER
        targetTransactionCategory.counter = targetTransactionCategory.counter + 1;
        await targetTransactionCategory.save({ session });
      }

      await session.commitTransaction();

      return true
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
