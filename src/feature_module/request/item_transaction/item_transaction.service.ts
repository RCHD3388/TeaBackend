import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRequestItemInput } from '../types/request_item.types';
import { RequestItemHeader } from '../schema/request_item.schema';
import { Warehouse } from 'src/feature_module/inventory/schema/warehouse.schema';
import { RequestItemType, RequestStatus } from '../types/request.types';
import { User } from 'src/feature_module/user/schema/user.schema';
import { Employee, EmployeeRole } from 'src/feature_module/person/schema/employee.schema';
import { Project } from 'src/feature_module/project/schema/project.schema';

@Injectable()
export class ItemTransactionService {
  constructor(
    @InjectModel(RequestItemHeader.name) private readonly requestItemHeaderModel: Model<RequestItemHeader>,
    @InjectModel(Warehouse.name) private readonly warehouseModel: Model<Warehouse>,
  ) { }

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

  
}
