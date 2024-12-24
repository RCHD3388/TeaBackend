import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CreateRequestItemInput, CustomRequestItem } from '../types/request_item.types';
import { RequestItemDetail, RequestItemHeader } from '../schema/request_item.schema';
import { Warehouse } from 'src/feature_module/inventory/schema/warehouse.schema';
import { RequestItem_ItemType, RequestItemType, RequestStatus, UpdateRequestStatusInput } from '../types/request.types';
import { User } from 'src/feature_module/user/schema/user.schema';
import { Employee, EmployeeRole } from 'src/feature_module/person/schema/employee.schema';
import { Project } from 'src/feature_module/project/schema/project.schema';
import { request } from 'http';
import { WarehouseService } from 'src/feature_module/inventory/warehouse.service';
import { MaterialTransactionService } from 'src/feature_module/inventory/transaction/material_transaction.service';
import { ToolTransactionService } from 'src/feature_module/inventory/transaction/tool_transaction.service';

@Injectable()
export class ItemTransactionService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(RequestItemHeader.name) private readonly requestItemHeaderModel: Model<RequestItemHeader>,
    @InjectModel(Warehouse.name) private readonly warehouseModel: Model<Warehouse>,
    private readonly warehouseService: WarehouseService,
    private readonly materialTransactionService: MaterialTransactionService,
    private readonly toolTransactionService: ToolTransactionService
  ) { }

  async findAll(): Promise<RequestItemHeader[]> {
    return await this.requestItemHeaderModel.find().populate(["requested_by", "requested_from", "requested_to", "handled_by"]).exec();
  }

  async findYourRequest(user: User): Promise<RequestItemHeader[]> {
    const employeeId = (user.employee as Employee)._id;

    return await this.requestItemHeaderModel.find({ requested_by: employeeId })
      .populate(["requested_by", "requested_from", "requested_to", "handled_by"])
      .exec();
  }

  async findYourApproval(user: User): Promise<CustomRequestItem[]> {
    const employeeId = (user.employee as Employee)._id;
    const employeeRoleName = ((user.employee as Employee).role as EmployeeRole).name;

    let currentUserWarehouse = await this.warehouseService.findAllByProjectLeader(user);
    let requestItemHeaders = await this.requestItemHeaderModel.find({ requested_to: { $in: currentUserWarehouse } })
      .populate(["requested_by", "requested_from", "handled_by"])
      .exec();

    return await Promise.all(requestItemHeaders.map(async (requestItemHeader) => {
      return {
        request_item_header: requestItemHeader,
        warehouse: currentUserWarehouse.filter(warehouse => (requestItemHeader.requested_to as String[]).includes(warehouse._id))
      };
    }));
  }

  async createRequestItem(createRequestItemInput: CreateRequestItemInput, user: User): Promise<RequestItemHeader> {
    const { requested_from, requested_to, request_item_detail, type } = createRequestItemInput;

    // check warehouse asal dan destinasi tidak boleh sama
    if (requested_from === requested_to) {
      throw new BadRequestException('warehouse tujuan dan destinasi tidak boleh sama');
    }
    // check detail item tidak boleh kosong
    if (request_item_detail.length <= 0) {
      throw new BadRequestException('Detail item tidak boleh kosong');
    }

    // check warehouse asal dan destinasi harus ada
    const requestedFromWarehouse = await this.warehouseModel.findById(requested_from).populate('project').exec();
    if (!requestedFromWarehouse) {
      throw new NotFoundException('Requested from warehouse not found');
    }
    const requestedToWarehouse = await this.warehouseModel.findById(requested_to).populate('project').exec();
    if (!requestedToWarehouse) {
      throw new NotFoundException('Requested to warehouse not found');
    }

    // check jika PEMINJAMAN maka WAREHOUSE TUJUAN HARUS merupakan project mandor
    // check jika PENGEMBALIAN maka WAREHOUSE ASAL HARUS merupakan project mandor
    if (((user.employee as Employee).role as EmployeeRole).name == "mandor") {
      if (type == RequestItemType.PEMINJAMAN) {
        if ((requestedToWarehouse.project as Project).project_leader.toString() != (user.employee as Employee)._id.toString()) {
          throw new BadRequestException('User tidak diperbolehkan melakukan aksi tersebut');
        }
      } else if (type == RequestItemType.PENGEMBALIAN) {
        if ((requestedFromWarehouse.project as Project).project_leader.toString() != (user.employee as Employee)._id.toString()) {
          throw new BadRequestException('User tidak diperbolehkan melakukan aksi tersebut');
        }
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
    });

    return await newRequestItemHeader.save();
  }

  async updateRequestItemStatus(id: string, updateRequestStatusInput: UpdateRequestStatusInput, user: User): Promise<RequestItemHeader> {
    let { status, handled_warehouse } = updateRequestStatusInput;
    let targetRequestItemHeader = await this.requestItemHeaderModel.findById(id).populate({
      path: 'requested_to',
      populate: {
        path: 'project',
        model: 'Project'
      }
    }).exec();
    // check if request item exist
    if (!targetRequestItemHeader) {
      throw new NotFoundException('Request Item dengan ID ' + id + ' tidak ditemukan');
    }

    // check jika sudah dibatalkan
    if (targetRequestItemHeader.status == RequestStatus.DIBATALKAN) {
      throw new BadRequestException('Request Item tersebut sudah dibatalkan');
    }
    // check jika sudah diselesaikan
    if (targetRequestItemHeader.status == RequestStatus.SELESAI) {
      throw new BadRequestException('Request Item tersebut sudah selesai');
    }
    // check request tidak bisa kembali ke menunggu jika sudah ditangani
    if (targetRequestItemHeader.status != RequestStatus.MENUNGGU && status == RequestStatus.MENUNGGU) {
      throw new BadRequestException('Request Item tersebut sudah ditangani, dan tidak dapat dikembalikan ke menunggu');
    }
    // check jika sudah ditangani dan ingin dibatalkan
    if (targetRequestItemHeader.status != RequestStatus.MENUNGGU && status == RequestStatus.DIBATALKAN) {
      throw new BadRequestException('Request Item tersebut sudah ditangani, dan tidak dapat dibatalkan');
    }

    // CHECK HANDLE REQUEST ITEM
    if (targetRequestItemHeader.handled_by == null) {
      // ==> 1. check apakah merupakan hadnle awal
      const projectLeaders = [];
      targetRequestItemHeader.requested_to.forEach((warehouse: any) => {
        if (warehouse && warehouse.project && warehouse.project.project_leader) {
          projectLeaders.push(warehouse.project.project_leader);
        }
      });
      // check hanya pembuat request yang dapat membatalkan request tersebut
      if (status == RequestStatus.DIBATALKAN && targetRequestItemHeader.requested_by != (user.employee as Employee)._id) {
        throw new BadRequestException('Hanya pembuat request yang dapat membatalkan request tersebut');
      }
      // check project leader valid
      if (status != RequestStatus.DIBATALKAN && !projectLeaders.includes((user.employee as Employee)._id)) {
        throw new BadRequestException('User tidak diperbolehkan melakukan aksi tersebut');
      }

    } else {
      // 2. check ketika sudah pernah di handle 
      if (targetRequestItemHeader.handled_by != (user.employee as Employee)._id) {
        throw new BadRequestException('User sudah ditangani oleh pegawai lain');
      }
    }


    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      // PROSES START

      // save request header data
      if (targetRequestItemHeader.status == RequestStatus.MENUNGGU
        && status != RequestStatus.DIBATALKAN
        && status != RequestStatus.MENUNGGU) {
        targetRequestItemHeader.handled_by = (user.employee as Employee)._id;
        targetRequestItemHeader.handled_warehouse = handled_warehouse;
      }
      targetRequestItemHeader.status = status;
      targetRequestItemHeader.handled_date = new Date();
      await targetRequestItemHeader.save({ session });

      // create transaction
      if (status == RequestStatus.DISETUJUI) {
        // check if handled_warehouse not exist
        if (targetRequestItemHeader.handled_warehouse == null) {
          throw new BadRequestException('Terjadi kesalahan, silakan coba lagi');
        }
        // get data transaction
        let item_detail = targetRequestItemHeader.request_item_detail;
        let material_item = await Promise.all(item_detail.filter((item: RequestItemDetail) => {
                              return item.item_type == RequestItem_ItemType.MATERIAL
                            }).map((item: RequestItemDetail) => {
                              return {
                                material: String(item.item),
                                qty: item.quantity,
                              }
                            }))
        let tool_item = item_detail.filter((item: RequestItemDetail) => {
                          return item.item_type == RequestItem_ItemType.TOOL
                        }).map((item: RequestItemDetail) => {
                          return String(item.item)
                        })

        let warehouse_from = targetRequestItemHeader.requested_from;
        let warehouse_to = targetRequestItemHeader.handled_warehouse;
        // ketika peminjaman maka akan ditukar
        if (targetRequestItemHeader.type == RequestItemType.PEMINJAMAN) {
          warehouse_from = targetRequestItemHeader.handled_warehouse;
          warehouse_to = targetRequestItemHeader.requested_from;
        }

        // get transaction data end
        if (material_item.length > 0) {
          await this.materialTransactionService.create({
            materials: material_item,
            transaction_category: "TRF",
            warehouse_from: String(warehouse_from),
            warehouse_to: String(warehouse_to)
          }, session)
        }
        if (tool_item.length > 0) {
          await this.toolTransactionService.create({
            tool: tool_item,
            transaction_category: "TRF",
            warehouse_from: String(warehouse_from),
            warehouse_to: String(warehouse_to)
          }, session)
        }
      }

      // PROSES END
      
      await session.commitTransaction();
      return targetRequestItemHeader
    } catch (error) {
      await session.abortTransaction();
      throw error
    } finally {
      await session.endSession();
    }
  }
}
