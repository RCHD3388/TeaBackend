import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CreateFinishingDetailInput, CreateProcessingDetailInput, CreateRequestItemDetailInput, CreateRequestItemInput, CustomOneRequestItem, CustomRequestItem, ProcessingToolDetailInput } from '../types/request_item.types';
import { RequestItemDetail, RequestItemHeader } from '../schema/request_item.schema';
import { Warehouse, WarehouseStatus } from 'src/feature_module/inventory/schema/warehouse.schema';
import { RequestItem_ItemType, RequestItemType, RequestStatus, UpdateRequestStatusInput } from '../types/request.types';
import { User } from 'src/feature_module/user/schema/user.schema';
import { Employee, EmployeeRole } from 'src/feature_module/person/schema/employee.schema';
import { Project } from 'src/feature_module/project/schema/project.schema';
import { request } from 'http';
import { WarehouseService } from 'src/feature_module/inventory/warehouse.service';
import { MaterialTransactionService } from 'src/feature_module/inventory/transaction/material_transaction.service';
import { ToolTransactionService } from 'src/feature_module/inventory/transaction/tool_transaction.service';
import { MaterialTransaction, ToolTransaction } from 'src/feature_module/inventory/schema/inventory_trans.schema';
import { Material, Sku, Tool } from 'src/feature_module/inventory/schema/inventory.schema';
import { MaterialService } from 'src/feature_module/inventory/material/material.service';
import { ToolService } from 'src/feature_module/inventory/tool/tool.service';
import { ToolSkuService } from 'src/feature_module/inventory/tool/toolsku.service';
import { populate } from 'dotenv';

@Injectable()
export class ItemTransactionService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(RequestItemHeader.name) private readonly requestItemHeaderModel: Model<RequestItemHeader>,
    @InjectModel(Warehouse.name) private readonly warehouseModel: Model<Warehouse>,
    private readonly warehouseService: WarehouseService,
    private readonly materialService: MaterialService,
    private readonly toolSkuService: ToolSkuService,
    private readonly materialTransactionService: MaterialTransactionService,
    private readonly toolTransactionService: ToolTransactionService
  ) { }
  // DONE
  async canFulfillRequest(requestedItems: CreateRequestItemDetailInput[], remainItems: MaterialTransaction[]) {
    // Buat map untuk mempermudah pencarian remainItems berdasarkan id
    const remainMap = new Map();
    remainItems.forEach(item => {
      remainMap.set((item.material as Material)._id.toString(), item.remain);
    });

    // Periksa apakah semua requestedItems dapat dipenuhi
    for (const request of requestedItems) {
      const remainQuantity = remainMap.get(request.item.toString()) || 0;
      if (remainQuantity < request.quantity) {
        return false; // Tidak cukup quantity untuk memenuhi request
      }
    }
    return true; // Semua requestedItems dapat dipenuhi
  }
  // CONE
  async canFulfillTools(requestedTools: CreateRequestItemDetailInput[], remainTools: ToolTransaction[]) {
    // 1. Buat map untuk menampung total stok berdasarkan sku
    const remainMap: Map<string, number> = new Map();

    // Buat set untuk mendeteksi duplikasi dalam requestedTools
    const requestedSkuSet: Set<string> = new Set();
    for (const requested of requestedTools) {
      const sku = String(requested.item);
      if (requestedSkuSet.has(sku)) {
        // Jika ditemukan duplikasi, return false
        return false;
      }
      requestedSkuSet.add(sku);
    }

    // 2. Hitung total quantity yang dimiliki per SKU
    for (const toolTrans of remainTools) {
      let currentToolSku = ((toolTrans.tool as Tool).sku as Sku)._id.toString();
      const currentQty = remainMap.get(currentToolSku) ?? 0;
      remainMap.set(currentToolSku, currentQty + 1);
    }

    // 3. Cek apakah tiap request (sku + quantity) dapat dipenuhi oleh remainMap
    for (const requested of requestedTools) {
      const availableQty = remainMap.get(String(requested.item)) ?? 0;
      if (availableQty < requested.quantity) {
        // jika stok tidak cukup untuk memenuhi salah satu item, return false
        return false;
      }
    }

    // 4. Jika semua permintaan dapat terpenuhi, return true
    return true;
  }
  // DONE
  async findAll(): Promise<RequestItemHeader[]> {
    return await this.requestItemHeaderModel.find().populate(["requested_by", "requested_from", "requested_to"]).exec();
  }
  // DONE
  async findYourRequest(user: User): Promise<RequestItemHeader[]> {
    const employeeId = (user.employee as Employee)._id;

    return await this.requestItemHeaderModel.find({ requested_by: employeeId })
      .populate(["requested_by", "requested_from", "requested_to"])
      .sort({ requested_at: -1 })
      .exec();
  }
  // DONE
  async findYourApproval(user: User): Promise<RequestItemHeader[]> {
    // mendapatkan seluruh warehouse milik project leader atau dari warehouse perusahaan admin tertentu
    let currentUserWarehouse = await this.warehouseService.findAllByProjectLeader(user);
    let target_warehouse = await Promise.all(currentUserWarehouse.map((warehouse) => {
      return warehouse._id.toString()
    }))
    // mencari request transaction yang mengandung warehouse milik project leader atau admin (untuk warehouse perusahaan)
    let requestItemHeaders = await this.requestItemHeaderModel.find({ requested_to: { $in: target_warehouse } })
      .populate(["requested_by", "requested_from", "requested_to"])
      .sort({ requested_at: -1 })
      .exec();

    return requestItemHeaders;
  }
  // DONE
  async findOneById(id: string, user: User): Promise<CustomOneRequestItem> {
    let targetRequest: RequestItemHeader = await this.requestItemHeaderModel.findById(id)
      .populate([
        "requested_by", "requested_from", "requested_to",
        {
          path: 'request_item_detail',
          populate: { path: 'tool', model: 'Tool', populate: { path: 'sku', model: 'Sku' } }
        }
      ])
      .exec();
    if (((user.employee as Employee).role as EmployeeRole).name == "mandor") {
      let currentUserWarehouse = await this.warehouseService.findAllByProjectLeader(user);
      let user_warehouse = await Promise.all(currentUserWarehouse.map((warehouse) => {
        return warehouse._id.toString()
      }))

      // check user adalah penerima atau pembuat request
      if (!user_warehouse.includes(targetRequest.requested_to.toString())
        && (targetRequest.requested_by as Employee)._id.toString() != (user.employee as Employee)._id.toString()) {
        throw new BadRequestException('User tidak diperbolehkan melakukan aksi tersebut');
      }
    }

    // get material data
    let material_ids = targetRequest.request_item_detail.filter((item: RequestItemDetail) => {
      return item.item_type == RequestItem_ItemType.MATERIAL
    }).map((item: RequestItemDetail) => {
      return item.item.toString()
    })

    let materials = await this.materialService.findByIds(material_ids);

    let sku_ids = targetRequest.request_item_detail.filter((item: RequestItemDetail) => {
      return item.item_type == RequestItem_ItemType.TOOL
    }).map((item: RequestItemDetail) => {
      return item.item.toString()
    })

    let skus = await this.toolSkuService.findByIds(sku_ids);

    let returnvalue: CustomOneRequestItem = {
      request_item_header: targetRequest,
      materials: materials,
      skus: skus
    }
    return returnvalue
  }
  // DONE
  async checkAvailabilityItem(checked_request_item_detail, requestedFromWarehouse) {
    let material_item = await Promise.all(checked_request_item_detail.filter((item: CreateRequestItemDetailInput) => {
      return item.item_type == RequestItem_ItemType.MATERIAL
    }))
    let toolsku_item = await Promise.all(checked_request_item_detail.filter((item: CreateRequestItemDetailInput) => {
      return item.item_type == RequestItem_ItemType.TOOL
    }))

    let remainMaterial = await this.materialTransactionService.getRemainItems(requestedFromWarehouse._id.toString());
    let remainTool = await this.toolTransactionService.getRemainItems(requestedFromWarehouse._id.toString());

    let canFulfillRequest = await this.canFulfillRequest(material_item, remainMaterial);
    let canFulfillTools = await this.canFulfillTools(toolsku_item, remainTool);

    if (!canFulfillRequest || !canFulfillTools) {
      return false
    }
    return true
  }

  // TERBARU UNTUK CHECK PROCESSING SESUAI SKU
  async checkValidToolForProcessing(requestedSku: { item: String, qty: number }[], targetOutTools: ProcessingToolDetailInput[]): Promise<boolean> {
    // 1. Buat map untuk menampung total stok berdasarkan sku
    const remainMap: Map<string, number> = new Map();

    // 2. Hitung total quantity yang dimiliki per SKU dari TARGET OUT
    for (const outTool of targetOutTools) {
      let currentToolSku = String(outTool.sku);
      remainMap.set(currentToolSku, outTool.tool.length);
    }

    // 3. Cek apakah tiap request (sku + quantity) dapat dipenuhi oleh remainMap
    // 3.1 cek apakah panjang remainMap sama dengan panjang requestedSku
    if (remainMap.size !== requestedSku.length) {
      return false;
    }

    for (const requested of requestedSku) {
      const availableQty = remainMap.get(String(requested.item)) ?? 0;
      if (availableQty != requested.qty) {
        // jika stok tidak cukup untuk memenuhi salah satu item, return false
        return false;
      }
    }

    // 4. Jika semua permintaan dapat terpenuhi, return true
    return true;
  }

  // CUD HANDLER
  // DONE
  async createRequestItem(createRequestItemInput: CreateRequestItemInput, user: User): Promise<RequestItemHeader> {
    const { requested_from, requested_to, request_item_detail, type } = createRequestItemInput;

    // check warehouse asal dan destinasi tidak boleh sama
    if (requested_from === requested_to) {
      throw new BadRequestException('warehouse tujuan dan destinasi tidak boleh sama');
    }
    // check detail item tidak boleh kosong
    let checked_request_item_detail = await Promise.all(request_item_detail.filter(detail => detail.quantity > 0));
    if (checked_request_item_detail.length <= 0) {
      throw new BadRequestException('Detail item tidak boleh kosong dan quantity tidak boleh 0');
    }

    // check warehouse asal dan destinasi harus ada
    const requestedFromWarehouse = await this.warehouseModel.findById(requested_from).populate('project').exec();
    if (!requestedFromWarehouse) {
      throw new NotFoundException('Requested from warehouse not found');
    }
    const requestedToWarehouse = await this.warehouseModel.findOne({
      _id: requested_to,
      status: WarehouseStatus.ACTIVE
    }).populate('project').exec();

    if (!requestedToWarehouse) {
      throw new NotFoundException('Requested to warehouse not found');
    }

    // check jika PEMINJAMAN maka WAREHOUSE TUJUAN HARUS merupakan project mandor
    // check jika PENGEMBALIAN maka WAREHOUSE ASAL HARUS merupakan project mandor
    if (((user.employee as Employee).role as EmployeeRole).name == "mandor") {
      if ((requestedFromWarehouse.project as Project).project_leader.toString() != (user.employee as Employee)._id.toString()) {
        throw new BadRequestException('User tidak diperbolehkan melakukan aksi tersebut');
      }
    }

    if (type == RequestItemType.PENGEMBALIAN) {
      // check AVAILABILITY
      let condition = await this.checkAvailabilityItem(checked_request_item_detail, requestedFromWarehouse);
      if (!condition) {
        throw new BadRequestException('Gagal, pastikan warehouse memiliki barang mencukupi dan tidak ada data sku yang terduplikasi');
      }
    }

    // create request
    const newRequestItemHeader = new this.requestItemHeaderModel({
      title: createRequestItemInput.title,
      description: createRequestItemInput.description || "",
      type: createRequestItemInput.type,
      requested_by: (user.employee as Employee)._id,
      requested_from,
      requested_to,
      requested_at: new Date(),
      status: RequestStatus.MENUNGGU,
      request_item_detail: checked_request_item_detail
    });

    return await newRequestItemHeader.save();
  }
  // DONE
  async cancelItemRequest(id: string, user: User): Promise<RequestItemHeader> {
    let targetRequest = await this.requestItemHeaderModel.findById(id).exec();
    if (!targetRequest) {
      throw new NotFoundException('Request Item dengan ID ' + id + ' tidak ditemukan');
    }
    if (targetRequest.status != RequestStatus.MENUNGGU && targetRequest.status != RequestStatus.DISETUJUI) {
      throw new BadRequestException('Request Item tersebut sudah diproses atau telah dibatalkan');
    }
    if (targetRequest.requested_by.toString() != (user.employee as Employee)._id.toString()) {
      throw new BadRequestException('Hanya pembuat permintaan yang dapat membatalkan permintaan tersebut');
    }

    targetRequest.status = RequestStatus.DIBATALKAN;
    return await targetRequest.save();
  }

  async processingItemRequest(id: string, createProcessingDetailInput: CreateProcessingDetailInput, user: User,): Promise<RequestItemHeader> {
    let targetRequest = await this.requestItemHeaderModel.findById(id).populate("requested_to").exec();
    if (!targetRequest) {
      throw new NotFoundException('Request Item dengan ID ' + id + ' tidak ditemukan');
    }

    // kalau peminjaman maka  langsung processing
    if (targetRequest.type == RequestItemType.PEMINJAMAN) {
      if (targetRequest.status != RequestStatus.MENUNGGU) {
        throw new BadRequestException('Request Item tersebut sudah diproses atau telah dibatalkan');
      }
      // ketika mandor dan bukan meruakan warehouse miliknya
      if (((user.employee as Employee).role as EmployeeRole).name == "mandor" && (targetRequest.requested_to as Warehouse).project_leader?.toString() != (user.employee as Employee)._id.toString()) {
        throw new BadRequestException('User tidak diperbolehkan melakukan aksi tersebut');
      }
      // ketika admin atau owner dan warehouse bukan gudang perusahaan
      if (((user.employee as Employee).role as EmployeeRole).name != "mandor" && (targetRequest.requested_to as Warehouse).project_leader) {
        throw new BadRequestException('User tidak diperbolehkan melakukan aksi tersebut');
      }
    }
    // kalau pengembalian harus disetujui
    if (targetRequest.type == RequestItemType.PENGEMBALIAN) {
      if (targetRequest.status != RequestStatus.DISETUJUI) {
        throw new BadRequestException('Request Item tersebut belum disetujui atau sedang di proses');
      }
      if (targetRequest.requested_by.toString() != (user.employee as Employee)._id.toString()) {
        throw new BadRequestException('User tidak diperbolehkan melakukan aksi tersebut');
      }
    }

    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      let item_detail = targetRequest.request_item_detail;
      let material_item = await Promise.all(item_detail.filter((item: RequestItemDetail) => {
        return item.item_type == RequestItem_ItemType.MATERIAL
      }).map((item: RequestItemDetail) => {
        return {
          material: String(item.item),
          qty: item.quantity
        }
      }))
      let toolsku_item = await Promise.all(item_detail.filter((item: RequestItemDetail) => {
        return item.item_type == RequestItem_ItemType.TOOL
      }).map((item: RequestItemDetail) => {
        return {
          item: String(item.item),
          qty: item.quantity
        }
      }))

      // warehouse out = ASAL (jika pengembalian), dan TUJUAN (jika kita pinjam)
      let warehouse = (targetRequest.requested_to as Warehouse)._id || targetRequest.requested_to;;
      if (targetRequest.type == RequestItemType.PENGEMBALIAN) {
        warehouse = targetRequest.requested_from;
      }

      if (material_item.length > 0) {
        let materialTransactionResult = await this.materialTransactionService.transferOutMaterial(String(warehouse), material_item, session)
        for (let i = 0; i < materialTransactionResult.length; i++) {
          const transaction = materialTransactionResult[i];
          const targetMaterial = targetRequest.request_item_detail.find(item => item.item_type == RequestItem_ItemType.MATERIAL && String(item.item) == transaction.material);
          if (targetMaterial) {
            targetMaterial.price = transaction.price;
          }
        }
      }
      if (toolsku_item.length > 0) {
        if (!(await this.checkValidToolForProcessing(toolsku_item, createProcessingDetailInput.processing_tool_detail))) {
          throw new BadRequestException('Pastikan jumlah tool yang diberikan sesuai dengan permintaan')
        }

        // melakukan flatten array menggabungkan semua tool yang akan di keluarkan dari warehouse menjadi sebuah array
        const targetOutTool: String[] = [];
        createProcessingDetailInput.processing_tool_detail.forEach((det) => {
          // currentArray adalah array tool
          targetOutTool.push(...det.tool);
        });
        // melakukan transaksi keluar dari warehouse
        await this.toolTransactionService.transferOutTool(String(warehouse), targetOutTool, session)

        // memberikan informasi pada database mengenai barang yang dikeluarkan
        createProcessingDetailInput.processing_tool_detail.forEach((det) => {
          const targetDetailIndex = targetRequest.request_item_detail.findIndex(item =>
            item.item_type == RequestItem_ItemType.TOOL &&
            String(item.item) == det.sku
          );
          if (targetDetailIndex == -1) throw new BadRequestException("Terjadi kesalahan proses transaksi perpindahan barang")
          targetRequest.request_item_detail[targetDetailIndex].tool = det.tool
        });
        await targetRequest.save({ session });
      }

      targetRequest.finishing_detail = {
        sender_name: createProcessingDetailInput.sender_name,
        sender_phone: createProcessingDetailInput.sender_phone,
        police_number: createProcessingDetailInput.police_number || "",
        vehicle_detail: createProcessingDetailInput.vehicle_detail || "",
      }

      targetRequest.status = RequestStatus.PENGIRIMAN;
      await targetRequest.save();
      await session.commitTransaction();

      return targetRequest
    } catch (error) {
      await session.abortTransaction();
      throw error
    } finally {
      await session.endSession();
    }
  }
  // DONE 
  async updateAvailableStatusItemRequest(id: string, status: RequestStatus.DITOLAK | RequestStatus.DISETUJUI, user: User): Promise<RequestItemHeader> {
    let targetRequest = await this.requestItemHeaderModel.findById(id).populate("requested_to").exec();
    if (!targetRequest) {
      throw new NotFoundException('Request Item dengan ID ' + id + ' tidak ditemukan');
    }

    if (targetRequest.status != RequestStatus.MENUNGGU) {
      throw new BadRequestException('Request Item tersebut sudah diproses atau telah dibatalkan');
    }

    if (((user.employee as Employee).role as EmployeeRole).name == "mandor") {
      // kalau project leader warehouse tujuan bukan user sekarang
      if ((targetRequest.requested_to as Warehouse).project_leader.toString() != (user.employee as Employee)._id.toString()) {
        throw new BadRequestException('User tidak diperbolehkan melakukan aksi tersebut');
      }
    }
    if (((user.employee as Employee).role as EmployeeRole).name != "mandor" && (targetRequest.requested_to as Warehouse).project_leader) {
      throw new BadRequestException('User tidak diperbolehkan melakukan aksi tersebut');
    }

    targetRequest.status = status;
    return await targetRequest.save();
  }

  async closedItemRequest(id: string, createFinishingDetailInput: CreateFinishingDetailInput, user: User) {
    let targetRequest = await this.requestItemHeaderModel.findById(id).populate("requested_to").exec();
    if (!targetRequest) {
      throw new NotFoundException('Request Item dengan ID ' + id + ' tidak ditemukan');
    }

    if (targetRequest.status != RequestStatus.PENGIRIMAN) {
      throw new BadRequestException('Request Item tersebut belum dikirim');
    }

    if (targetRequest.type == RequestItemType.PEMINJAMAN) {
      if (targetRequest.requested_by.toString() != (user.employee as Employee)._id.toString()) {
        throw new BadRequestException('Hanya penerima yang dapat menutup atau menyelesaikan permintaan tersebut');
      }
    }
    if (targetRequest.type == RequestItemType.PENGEMBALIAN) {
      if (((user.employee as Employee).role as EmployeeRole).name == "mandor" && (targetRequest.requested_to as Warehouse).project_leader?.toString() != (user.employee as Employee)._id.toString()) {
        throw new BadRequestException('Hanya penerima yang dapat menutup atau menyelesaikan permintaan tersebut');
      }
      if (((user.employee as Employee).role as EmployeeRole).name != "mandor" && (targetRequest.requested_to as Warehouse).project_leader) {
        throw new BadRequestException('Hanya penerima yang dapat menutup atau menyelesaikan permintaan tersebut');
      }
    }

    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      let item_detail = targetRequest.request_item_detail;
      let material_item = await Promise.all(item_detail.filter((item: RequestItemDetail) => {
        return item.item_type == RequestItem_ItemType.MATERIAL
      }).map((item: RequestItemDetail) => {
        return {
          material: String(item.item),
          qty: item.quantity,
          price: item.price
        }
      }))
      let tool_item = []
      item_detail.forEach((item: RequestItemDetail) => {
        if (item.item_type == RequestItem_ItemType.TOOL) {
          tool_item.push(...item.tool)
        }
      })


      let warehouse = targetRequest.requested_from;
      if (targetRequest.type == RequestItemType.PENGEMBALIAN) {
        warehouse = (targetRequest.requested_to as Warehouse)._id || targetRequest.requested_to;
      }

      if (material_item.length > 0) {
        await this.materialTransactionService.transferInMaterial(String(warehouse), material_item, session)
      }
      if (tool_item.length > 0) {
        await this.toolTransactionService.transferInTool(String(warehouse), tool_item, session)
      }

      targetRequest.finishing_detail.recipient_name = createFinishingDetailInput.recipient_name;
      targetRequest.finishing_detail.recipient_phone = createFinishingDetailInput.recipient_phone;
      targetRequest.finishing_detail.recipient_description = createFinishingDetailInput.recipient_description || "";

      targetRequest.status = RequestStatus.SELESAI;
      await targetRequest.save({ session });

      await session.commitTransaction();
      return targetRequest
    } catch (error) {
      await session.abortTransaction();
      throw error
    } finally {
      await session.endSession();
    }


  }
}
