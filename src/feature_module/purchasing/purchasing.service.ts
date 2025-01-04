import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { PurchaseOrder, PurchaseOrderDetail, PurchaseTransaction } from './schema/purchasing.schema';
import { CreateRequestPOInput, CustomOneRequestPO, ReceiveItemInput } from './types/purchasing_types.types';
import { User } from '../user/schema/user.schema';
import { WarehouseService } from '../inventory/warehouse.service';
import { RequestItem_ItemType, RequestStatus } from '../request/types/request.types';
import { MaterialService } from '../inventory/material/material.service';
import { ToolService } from '../inventory/tool/tool.service';
import { ToolSkuService } from '../inventory/tool/toolsku.service';
import { Employee, EmployeeRole } from '../person/schema/employee.schema';
import { MaterialTransactionService } from '../inventory/transaction/material_transaction.service';
import { ToolTransactionService } from '../inventory/transaction/tool_transaction.service';
import { FilterInput } from '../types/global_input_types.types';

@Injectable()
export class PurchasingService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(PurchaseOrder.name) private readonly purchaseOrderModel: Model<PurchaseOrder>,
    @InjectModel(PurchaseTransaction.name) private readonly purchaseTransactionModel: Model<PurchaseTransaction>,
    private readonly warehouseService: WarehouseService,
    private readonly materialService: MaterialService,
    private readonly toolskuService: ToolSkuService,
    private readonly toolService: ToolService,
    private readonly materialTransactionService: MaterialTransactionService,
    private readonly toolTransactionService: ToolTransactionService,
  ) { }

  // admin owner 
  async getAllPurchaseOrders(filter: FilterInput): Promise<PurchaseOrder[]> {
    let filt = {}
    if (filter) {
      filt = {
        $or: [{ status: RequestStatus.DISETUJUI }, { status: RequestStatus.SELESAI }]
      };
    }
    return await this.purchaseOrderModel.find(filt)
      .sort({ date: -1 })
      .populate(["requested_from", "requested_by"]).exec();
  }

  // admin owner mandor
  async getPurchaseOrderByUser(user: User): Promise<PurchaseOrder[]> {
    return await this.purchaseOrderModel.find({ requested_by: (user.employee as Employee)._id.toString() })
      .populate(["requested_from", "requested_by"])
      .sort({ date: -1 })
      .exec();
  }

  // admin owner mandor
  async getPurchaseOrderById(id: string, user: User): Promise<CustomOneRequestPO> {
    let po = await this.purchaseOrderModel.findById(id).populate(["requested_from", "requested_by"]).exec();
    if (!po) throw new NotFoundException('PO tidak ditemukan');

    // jika merupakan mandor dan PO bukan dibuat oleh mandor tersebut
    if (((user.employee as Employee).role as EmployeeRole).name == "mandor" &&
      (po.requested_by as Employee)._id.toString() !== String((user.employee as Employee)._id.toString())) {
      throw new BadRequestException('Anda tidak dapat mengakses Purchase Order ini');
    }

    let material_ids = po.purchase_order_detail.filter((item: PurchaseOrderDetail) => {
      return item.item_type == RequestItem_ItemType.MATERIAL
    }).map((item: PurchaseOrderDetail) => {
      return item.item.toString()
    })

    let materials = await this.materialService.findByIds(material_ids);

    let sku_ids = po.purchase_order_detail.filter((item: PurchaseOrderDetail) => {
      return item.item_type == RequestItem_ItemType.TOOL
    }).map((item: PurchaseOrderDetail) => {
      return item.item.toString()
    })

    let skus = await this.toolskuService.findByIds(sku_ids);

    let custom_data: CustomOneRequestPO = {
      purchase_order: po,
      materials: materials,
      skus: skus
    }
    return custom_data;
  }

  async getRelatedPTfromPO(id: string, user: User): Promise<PurchaseTransaction[]> {
    let po = (await this.getPurchaseOrderById(id, user)).purchase_order;
    if (po.status == RequestStatus.SELESAI) {
      return []
    }

    // item ids yang masih dibutuhkan
    const PO_details = po.purchase_order_detail.filter(detail => detail.quantity > detail.completed_quantity);
    const itemIds = PO_details.map(detail => detail.item.toString());

    let relatedPT = await this.purchaseTransactionModel.find({
      "purchase_transaction_detail": {
        $elemMatch: {
          "item": { $in: itemIds },
          "purchase_order": id
        }
      }
    }).exec();

    const formatedPT = await Promise.all(relatedPT.map(async (pt) => {
      let filteredDetail = pt.purchase_transaction_detail.filter(detail =>
        // check items include dan purchase order benar
        itemIds.includes(detail.item.toString()) && detail.purchase_order == id &&
        // check POdetail tidak memiliki sub detail yang mengarah ke transaksi tersebut
        !po.purchase_order_detail.some(
          (pod) => pod.sub_detail.some(
            (sbd) => sbd.purchase_transaction == pt._id.toString() && sbd.purchase_transaction_detail == detail._id.toString()
          )
        )
      );

      pt.purchase_transaction_detail = filteredDetail;
      return pt
    }))

    return formatedPT;
  }

  // admin owner mandor
  async createPurchaseOrder(createPurchaseOrderInput: CreateRequestPOInput, user: User): Promise<PurchaseOrder> {
    let { requested_from, purchase_order_detail } = createPurchaseOrderInput;

    let currentWarehouse = await this.warehouseService.findAllByProjectLeader(user);
    let userRole = ((user.employee as Employee).role as EmployeeRole).name;

    const warehouseExists = currentWarehouse.some(warehouse => warehouse._id.toString() === requested_from);
    if (!warehouseExists) {
      throw new NotFoundException('Gudang yang diminta tidak ditemukan untuk pengguna saat ini');
    }

    if (purchase_order_detail.length == 0) {
      throw new BadRequestException('Detail item tidak boleh kosong');
    }

    // get material & toolsku
    let materialItems = purchase_order_detail.filter(detail => detail.item_type == RequestItem_ItemType.MATERIAL);
    let toolItems = purchase_order_detail.filter(detail => detail.item_type == RequestItem_ItemType.TOOL);

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

    let newPO = new this.purchaseOrderModel({
      title: createPurchaseOrderInput.title,
      description: createPurchaseOrderInput.description || "",
      requested_from: requested_from,
      requested_by: (user.employee as Employee)._id.toString(),
      date: new Date(),
      status: userRole == "mandor" ? RequestStatus.MENUNGGU : RequestStatus.DISETUJUI,
      purchase_order_detail: purchase_order_detail
    });

    await newPO.save();
    return newPO;
  }

  // admin owner
  async handleWaitingPO(id: string, status: RequestStatus): Promise<PurchaseOrder> {
    let po = await this.purchaseOrderModel.findOne({ _id: id, status: RequestStatus.MENUNGGU }).exec();
    if (!po) throw new NotFoundException('PO yang sedang menunggu persetujuan tidak ditemukan');

    if (status != RequestStatus.DITOLAK && status != RequestStatus.DISETUJUI) {
      throw new BadRequestException('PO hanya boleh disetejui atau ditolak');
    }
    po.status = status;
    return await po.save();
  }

  async cancelPurchaseOrder(id: string, user: User): Promise<PurchaseOrder> {
    let po = await this.purchaseOrderModel.findOne({ _id: id, status: RequestStatus.MENUNGGU }).exec();
    if (!po) throw new NotFoundException('PO yang sedang menunggu persetujuan tidak ditemukan');

    if (po.requested_by.toString() !== (user.employee as Employee)._id.toString()) {
      throw new BadRequestException('Hanya pembuat Purchase Order yang dapat membatalkannya');
    }

    po.status = RequestStatus.DIBATALKAN;
    return await po.save();
  }


  // admin owner mandor
  async handleReceivedPODetail(id: string, receiveItemInput: ReceiveItemInput, user: User): Promise<PurchaseOrder> {
    let { item_transaction, item_transaction_detail } = receiveItemInput;

    // check po exist & handled by request_by user
    let po = await this.purchaseOrderModel.findOne({ _id: id, status: RequestStatus.DISETUJUI }).exec();
    if (!po) throw new NotFoundException('PO yang disetujui tidak ditemukan');
    if (po.requested_by != (user.employee as Employee)._id.toString()) {
      throw new BadRequestException('Hanya pembuat PO yang dapat konfirmasi penerimaan barang');
    }

    // check transaction exist & detail exist
    let targetTransaction = await this.purchaseTransactionModel.findOne({
      _id: item_transaction,
      "purchase_transaction_detail": {
        $elemMatch: {
          _id: item_transaction_detail,
          purchase_order: id
        }
      }
    }).exec();
    if (!targetTransaction) {
      throw new NotFoundException('Transaksi untuk order pembelian tersebut tidak ditemukan');
    }

    // get RELATED TRANS_DETAIL & PO_DETAIL
    let targetTransactionDetail = targetTransaction.purchase_transaction_detail.find(detail => detail._id.toString() == item_transaction_detail);

    let edittedPODetailIndex = po.purchase_order_detail.findIndex(detail => detail.item == targetTransactionDetail.item);
    if (edittedPODetailIndex == -1) {
      throw new BadRequestException('PO Detail tidak ditemukan');
    }
    let targetPurchaseOrderDetail = po.purchase_order_detail[edittedPODetailIndex];
    if (targetPurchaseOrderDetail.sub_detail.some(sbd =>
      sbd.purchase_transaction == targetTransaction._id.toString() &&
      sbd.purchase_transaction_detail == targetTransactionDetail._id.toString()
    )) {
      throw new BadRequestException('Transaksi ini sudah diterima sebelumnya');
    }

    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      let remainNeeded = targetPurchaseOrderDetail.quantity - targetPurchaseOrderDetail.completed_quantity;
      if (remainNeeded < targetTransactionDetail.quantity) {
        throw new BadRequestException('Jumlah barang yang diterima tidak boleh melebihi jumlah yang dibutuhkan')
      }

      // MATERIAL ITEM
      if (targetTransactionDetail.item_type == RequestItem_ItemType.MATERIAL) {
        await this.materialTransactionService.create({
          materials: [{
            material: targetTransactionDetail.original_item,
            qty: targetTransactionDetail.quantity,
            price: targetTransactionDetail.price
          }],
          warehouse_to: String(po.requested_from),
          transaction_category: "PUR"
        }, session);
        // TOOL ITEM
      } else if (targetTransactionDetail.item_type == RequestItem_ItemType.TOOL) {
        await this.toolTransactionService.create({
          tool: [targetTransactionDetail.original_item],
          warehouse_to: String(po.requested_from),
          transaction_category: "PUR"
        }, session)
      }

      po.purchase_order_detail[edittedPODetailIndex].completed_quantity += targetTransactionDetail.quantity;
      po.purchase_order_detail[edittedPODetailIndex].sub_detail.push({
        purchase_transaction: targetTransaction._id.toString(),
        purchase_transaction_detail: targetTransactionDetail._id.toString(),
        quantity: targetTransactionDetail.quantity
      })

      let allCompleted = po.purchase_order_detail.every(detail => detail.quantity == detail.completed_quantity);
      if (allCompleted) {
        po.status = RequestStatus.SELESAI;
      }

      await po.save({ session })

      await session.commitTransaction();
      return po;
    } catch (error) {
      await session.abortTransaction();
      throw error
    } finally {
      await session.endSession();
    }
  }
}
