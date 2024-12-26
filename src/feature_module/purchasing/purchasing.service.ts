import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PurchaseOrder, PurchaseTransaction } from './schema/purchasing.schema';
import { CreateRequestPOInput } from './types/purchasing_types.types';
import { User } from '../user/schema/user.schema';
import { WarehouseService } from '../inventory/warehouse.service';
import { RequestItem_ItemType, RequestStatus } from '../request/types/request.types';
import { MaterialService } from '../inventory/material/material.service';
import { ToolService } from '../inventory/tool/tool.service';
import { ToolSkuService } from '../inventory/tool/toolsku.service';
import { Employee, EmployeeRole } from '../person/schema/employee.schema';

@Injectable()
export class PurchasingService {
  constructor(
    @InjectModel(PurchaseOrder.name) private readonly purchaseOrderModel: Model<PurchaseOrder>,
    @InjectModel(PurchaseTransaction.name) private readonly purchaseTransactionModel: Model<PurchaseTransaction>,
    private readonly warehouseService: WarehouseService,
    private readonly materialService: MaterialService,
    private readonly toolskuService: ToolSkuService
  ) { }

  // admin owner 
  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await this.purchaseOrderModel.find().populate(["requested_from", "requested_by"]).exec();
  }

  // admin owner mandor
  async getPurchaseOrderByUser(user: User): Promise<PurchaseOrder[]> {
    return await this.purchaseOrderModel.find({ requested_by: (user.employee as Employee)._id.toString() })
      .populate(["requested_from", "requested_by"]).exec();
  }

  // admin owner mandor
  async getPurchaseOrderById(id: string, user): Promise<PurchaseOrder> {
    let po = await this.purchaseOrderModel.findById(id).populate(["requested_from", "requested_by"]).exec();
    if (!po) throw new NotFoundException('PO tidak ditemukan');

    // jika merupakan mandor dan PO bukan dibuat oleh mandor tersebut
    if (((user.employee as Employee).role as EmployeeRole).name == "mandor" &&
      (po.requested_by as Employee)._id.toString() !== String((user.employee as Employee)._id.toString())) {
      throw new BadRequestException('Anda tidak dapat mengakses Purchase Order ini');
    }

    // populate manualy material and tool
    let formatedPODetail = await Promise.all(po.purchase_order_detail.map(async (detail) => {
      let item = null;
      let sku = null;
      if (detail.item_type == RequestItem_ItemType.MATERIAL) {
        item = await this.materialService.findOne(detail.item.toString())
      }
      if (detail.item_type == RequestItem_ItemType.TOOL) {
        sku = await this.toolskuService.findOne(detail.item.toString())
      }
      return {...detail, item, sku}
    }))

    // format new purchase order with detail item material or tool
    po.purchase_order_detail = formatedPODetail;

    return po;
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
      requested_by: user._id.toString(),
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

    if (status != RequestStatus.MENUNGGU && status != RequestStatus.DISETUJUI) {
      throw new BadRequestException('PO hanya boleh disetejui atau ditolak');
    }
    po.status = status;
    return await po.save();
  }
}
