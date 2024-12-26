import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { PurchaseOrder, PurchaseTransaction, PurchaseTransactionDetail } from './schema/purchasing.schema';
import { CreatePurchaseTransactionDetailInput, CreateRequestPOInput, CreateRequestPurchaseTransactionInput, UpdateRequestPurchaseTransactionInput } from './types/purchasing_types.types';
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
export class PurchasingService {
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


  // admin owner staff pembelian
  async createPurchaseTransaction(createPurchaseTransactionInput: CreateRequestPurchaseTransactionInput, user: User): Promise<PurchaseTransaction> {
    let { supplier, purchase_transaction_detail } = createPurchaseTransactionInput;

    // check supplier valid ditemukan dan status active
    let supplierValid = await this.supplierService.findSupplierById(supplier.toString());
    if (supplierValid == null || supplierValid.status != SupplierStatus.ACTIVE) {
      throw new BadRequestException('Supplier tidak aktif tidak ditemukan');
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
        "purchase_order_detail": {
          $elemMatch: {
            "item": detail.item,
            "item_type": detail.item_type,
            $expr: { $lt: ['$completion', '$quantity'] }
          }
        }
      });
      if (po == null) {
        throw new NotFoundException('Purchase order yang dituju tidak ditemukan atau tidak meminta item yang sama');
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
        let itemId = detail.item.toString();
        if (detail.item_type == RequestItem_ItemType.TOOL) {
          let newTool = await this.toolService.create(detail.tool, session);
          itemId = newTool;
        }
        purchaseTransactionDetail.push({
          purchase_order: detail.purchase_order.toString(),
          item: itemId,
          item_type: detail.item_type.toString(),
          quantity: detail.quantity,
          price: detail.price,
          subtotal: detail.quantity * detail.price
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
      newPurchaseTransaction.save({ session })

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

    target.purchase_transaction_detail.splice(index, 1);
    target.total -= detail.subtotal;
    target.save();
    return target
  }

  async addNewDetail(id: string, createPurchaseTransactionDetailInput: CreatePurchaseTransactionDetailInput, user: User): Promise<PurchaseTransaction> {
    let target = await this.purchaseTransactionModel.findOne({ _id: id, purchasing_staff: (user.employee as Employee)._id.toString() }).exec();
    if (!target) throw new NotFoundException('Purchase transaction anda tidak ditemukan');

    let { purchase_order, item, item_type, quantity, price, tool } = createPurchaseTransactionDetailInput;

    // check availability PO
    let po = await this.purchaseOrderModel.findOne({
      _id: purchase_order.toString(),
      "purchase_order_detail": {
        $elemMatch: {
          "item": item.toString(),
          "item_type": item_type,
          $expr: { $lt: ['$completion', '$quantity'] }
        }
      }
    });
    if (po == null) {
      throw new NotFoundException('Purchase order yang dituju tidak ditemukan atau tidak meminta item yang sama');
    }


    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      // mendapatkan id tool atau material
      let itemId = item.toString();
      if (item_type == RequestItem_ItemType.TOOL) {
        let newTool = await this.toolService.create(tool, session);
        itemId = newTool;
      }

      // create new purchase transaction detail
      let purchaseTransactionDetail: PurchaseTransactionDetail = {
        purchase_order: purchase_order.toString(),
        item: itemId,
        item_type: item_type.toString(),
        quantity: quantity,
        price: price,
        subtotal: quantity * price
      };

      target.purchase_transaction_detail.push(purchaseTransactionDetail);
      target.total += purchaseTransactionDetail.subtotal;
      target.save({ session });

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
