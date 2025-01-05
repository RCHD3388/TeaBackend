import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { PurchaseOrder, PurchaseTransaction, PurchaseTransactionDetail } from './schema/purchasing.schema';
import { CreateNewPurchaseTransactionDetailInput, CreatePurchaseTransactionDetailInput, CreateRequestPOInput, CreateRequestPurchaseTransactionInput, UpdateRequestPurchaseTransactionInput } from './types/purchasing_types.types';
import { User } from '../user/schema/user.schema';
import { WarehouseService } from '../inventory/warehouse.service';
import { RequestItem_ItemType, RequestStatus } from '../request/types/request.types';
import { MaterialService } from '../inventory/material/material.service';
import { ToolService } from '../inventory/tool/tool.service';
import { ToolSkuService } from '../inventory/tool/toolsku.service';
import { Employee, EmployeeRole } from '../person/schema/employee.schema';
import { SupplierService } from '../person/supplier.service';
import { SupplierStatus } from '../person/schema/supplier.schema';

@Injectable()
export class PurchasingTransactionService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(PurchaseOrder.name) private readonly purchaseOrderModel: Model<PurchaseOrder>,
    @InjectModel(PurchaseTransaction.name) private readonly purchaseTransactionModel: Model<PurchaseTransaction>,
    private readonly warehouseService: WarehouseService,
    private readonly materialService: MaterialService,
    private readonly toolService: ToolService,
    private readonly toolskuService: ToolSkuService,
    private readonly supplierService: SupplierService
  ) { }


  // admin owner
  async getAllPurchaseTransactions(): Promise<PurchaseTransaction[]> {
    let targetPurchasing = await this.purchaseTransactionModel.find()
      .populate(["purchasing_staff", "supplier"])
      .sort({ transaction_date: -1 })
      .exec();
    return targetPurchasing
  }

  // admin owner staffpembelian
  async getPurchaseTransactionByPurchasingStaff(user: User): Promise<PurchaseTransaction[]> {
    
    let data = await this.purchaseTransactionModel.find({ purchasing_staff: (user.employee as Employee)._id.toString() })
      .populate(["purchasing_staff", "supplier"])
      .sort({ transaction_date: -1 }).exec();
      
    return data
  }

  // admin owner mandor staffpembelian
  async getPurchaseTransactionById(id: string, user: User): Promise<PurchaseTransaction> {
    let pt = await this.purchaseTransactionModel.findById(id).populate("purchasing_staff", "supplier").exec();
    if (!pt) throw new NotFoundException('Purchase transaction tidak ditemukan');

    // jika role adalah staff_pembelian maka purchasing staff harus user
    if (((user.employee as Employee).role as EmployeeRole).name == "staff_pembelian" &&
      (pt.purchasing_staff as Employee)._id.toString() !== (user.employee as Employee)._id.toString()) {
      throw new BadRequestException('Anda tidak dapat mengakses Purchase Transaction ini');
    }

    return pt;
  }

  // admin owner staff pembelian
  async createPurchaseTransaction(createPurchaseTransactionInput: CreateRequestPurchaseTransactionInput, user: User): Promise<PurchaseTransaction> {
    let { transaction_number, supplier, purchase_transaction_detail } = createPurchaseTransactionInput;

    // check supplier valid ditemukan dan status active
    let supplierValid = await this.supplierService.findSupplierById(supplier.toString());
    if (supplierValid == null || supplierValid.status != SupplierStatus.ACTIVE) {
      throw new BadRequestException('Supplier aktif tidak ditemukan');
    }

    let checkTNumber = await this.purchaseTransactionModel.findOne({transaction_number}).exec();
    if (checkTNumber) {
      throw new BadRequestException('Nomor transaksi sudah ada');
    }

    // PADA MASING MASING DETAIL
    // 1. check item (material atau sku) dan pastikan ditemukana pada material atau sku SESUAI item_type
    // 2. jika merupakan tool pastikan field tool diberikan, lalu create tool tersebut
    // 3. pastikan purchase order yang dibuat meminta item tersebut dan belum terpenuhi
    // 4. create purchase transaction detail

    // NOMER 1
    // get material & toolsku
    let materialItems = purchase_transaction_detail.filter(detail => detail.item_type == RequestItem_ItemType.MATERIAL);
    let toolItems = purchase_transaction_detail.filter(detail => detail.item_type == RequestItem_ItemType.TOOL);
    // get ids only
    let materialIds = materialItems.map(detail => String(detail.item));
    let toolskuIds = toolItems.map(detail => String(detail.item));
    // check in db
    let materials = await this.materialService.findByIds(materialIds, true);
    let toolskus = await this.toolskuService.findByIds(toolskuIds, true);

    materialIds = [...new Set(materialIds)];
    toolskuIds = [...new Set(toolskuIds)];

    if (materials.length != materialIds.length) {
      throw new NotFoundException('Terdapat material yang belum terdaftar tidak ditemukan')
    }
    if (toolskus.length != toolskuIds.length) {
      throw new NotFoundException('Terdapat sku yang belum terdaftar tidak ditemukan')
    }

    // NOMER 2
    // pastikan input pembuatan tool diberikan untuk type tool
    let toolsku = toolItems.findIndex(detail => detail.tool == null);
    if (toolsku != -1) {
      throw new BadRequestException('Perlu memberikan informasi peralatan untuk setiap sku');
    }

    // NOMER 3
    // pastikan purchase order yang dibuat meminta item tersebut dan belum terpenuhi
    for (let i = 0; i < purchase_transaction_detail.length; i++) {
      let detail = purchase_transaction_detail[i];
      let po = await this.purchaseOrderModel.findOne({
        _id: detail.purchase_order,
        status: RequestStatus.DISETUJUI,
        "purchase_order_detail": {
          $elemMatch: {
            "item": detail.item,
            "item_type": detail.item_type,
          }
        }
      });

      if (po == null) {
        throw new BadRequestException('Purchase order yang dituju tidak ditemukan atau tidak meminta item yang sama, dan juga pastikan PO sudah disetujui');
      }
    }

    // CREATE PURCHASE TRANSACTION

    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      let purchaseTransactionDetail: PurchaseTransactionDetail[] = [];
      let total = 0;
      // format detail purchase transaction
      for (let i = 0; i < purchase_transaction_detail.length; i++) {
        let detail = purchase_transaction_detail[i];
        // mendapatkan id tool
        let original_item = detail.item.toString();
        if (detail.item_type == RequestItem_ItemType.TOOL) {
          let newTool = await this.toolService.create(detail.tool, session);
          original_item = newTool.toString();
        }
        purchaseTransactionDetail.push({
          purchase_order: detail.purchase_order.toString(),
          item: detail.item.toString(),
          item_type: detail.item_type.toString(),
          quantity: detail.quantity,
          price: detail.price,
          subtotal: detail.quantity * detail.price,
          original_item
        });
        total += detail.quantity * detail.price;
      }

      let newPurchaseTransaction = new this.purchaseTransactionModel({
        purchasing_staff: (user.employee as Employee)._id.toString(),
        transaction_number: createPurchaseTransactionInput.transaction_number,
        description: createPurchaseTransactionInput.description || "",
        transaction_date: createPurchaseTransactionInput.transaction_date,
        supplier: supplier.toString(),
        total: total,
        purchase_transaction_detail: purchaseTransactionDetail
      });
      await newPurchaseTransaction.save({ session })

      await session.commitTransaction();
      return newPurchaseTransaction
    } catch (error) {
      await session.abortTransaction();
      throw error
    } finally {
      await session.endSession();
    }
  }

  // only purchasing staff handled
  async update(id: string, updatePurchaseTransactionInput: UpdateRequestPurchaseTransactionInput, user: User): Promise<PurchaseTransaction> {
    let { supplier } = updatePurchaseTransactionInput;

    let target = await this.purchaseTransactionModel.findOne({ _id: id, purchasing_staff: (user.employee as Employee)._id.toString() }).exec();
    if (!target) throw new NotFoundException('Purchase transaction anda tidak ditemukan');

    // update supplier
    if (supplier) {
      let supplierValid = await this.supplierService.findSupplierById(supplier.toString());
      if (supplierValid == null || supplierValid.status != SupplierStatus.ACTIVE) {
        throw new NotFoundException('Supplier tidak ditemukan');
      }
      target.supplier = supplier.toString();
    }

    target.transaction_number = updatePurchaseTransactionInput.transaction_number.toString() || target.transaction_number;
    target.description = updatePurchaseTransactionInput.description || target.description;
    target.transaction_date = updatePurchaseTransactionInput.transaction_date || target.transaction_date;
    target.save();
    return target
  }

  async removeDetail(id: string, id_detail: string, user: User): Promise<PurchaseTransaction> {
    let target = await this.purchaseTransactionModel.findOne({ _id: id, purchasing_staff: (user.employee as Employee)._id.toString() }).exec();
    if (!target) throw new NotFoundException('Purchase transaction anda tidak ditemukan');

    // apakah terdapat id detail tersebut
    let index = target.purchase_transaction_detail.findIndex(detail => detail._id == id_detail);
    if (index == -1) throw new NotFoundException('Detail purchase transaction tidak ditemukan');

    let detail = target.purchase_transaction_detail[index];
    let po = await this.purchaseOrderModel.find({
      _id: detail.purchase_order,
      "purchase_order_detail": {
        $elemMatch: {
          "sub_detail": {
            $elemMatch: {
              "purchase_transaction_detail": id_detail
            }
          }
        }
      }
    }).exec();
    if (po.length > 0) {
      throw new BadRequestException('Purchase order tidak dapat dihapus karena sudah diterima pada gudang tujuan');
    }

    if (target.purchase_transaction_detail[index].item_type == RequestItem_ItemType.TOOL) {
      await this.toolService.remove(target.purchase_transaction_detail[index].original_item.toString())
    }

    target.purchase_transaction_detail.splice(index, 1);
    target.total -= detail.subtotal;
    target.save();
    return target
  }

  async addNewDetailPT(id: string, createPurchaseTransactionDetailInput: CreateNewPurchaseTransactionDetailInput, user: User): Promise<PurchaseTransaction> {
    let target = await this.purchaseTransactionModel.findOne({ _id: id, purchasing_staff: (user.employee as Employee)._id.toString() }).exec();
    if (!target) throw new NotFoundException('Purchase transaction anda tidak ditemukan');

    let { purchase_order, item, item_type, quantity, price, tool } = createPurchaseTransactionDetailInput.input;

    // check availability PO
    let po = await this.purchaseOrderModel.findOne({
      _id: purchase_order.toString(),
      status: RequestStatus.DISETUJUI,
      "purchase_order_detail": {
        $elemMatch: {
          "item": item.toString(),
          "item_type": item_type
        }
      }
    });
    if (po == null) {
      throw new NotFoundException('Purchase order yang dituju tidak ditemukan atau tidak meminta item yang sama, dan juga pastikan PO sudah disetujui');
    }
    if (item_type == RequestItem_ItemType.TOOL && !tool) {
      throw new NotFoundException('Perlu memberikan informasi peralatan untuk setiap sku');
    }

    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      // mendapatkan id tool atau material
      let original_item = item.toString();
      if (item_type == RequestItem_ItemType.TOOL) {
        let newTool = await this.toolService.create(tool, session);
        original_item = newTool;
      }

      // create new purchase transaction detail
      let purchaseTransactionDetail: PurchaseTransactionDetail = {
        purchase_order: purchase_order.toString(),
        item: item.toString(),
        item_type: item_type.toString(),
        quantity: quantity,
        price: price,
        subtotal: quantity * price,
        original_item
      };

      target.purchase_transaction_detail.push(purchaseTransactionDetail);
      target.total += purchaseTransactionDetail.subtotal;
      await target.save({ session });

      await session.commitTransaction();
      return target;
    } catch (error) {
      await session.abortTransaction();
      throw error
    } finally {
      await session.endSession();
    }
  }
}
