import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { RequestProjectClosing } from '../schema/request_closing.schema';
import { Project } from 'src/feature_module/project/schema/project.schema';
import { RequestStatus, UpdateRequestStatusInput } from '../types/request.types';
import { CreateRequestClosingInput } from '../types/request_closing.types';
import { User } from 'src/feature_module/user/schema/user.schema';
import { Employee, EmployeeRole } from 'src/feature_module/person/schema/employee.schema';
import { ProjectService } from 'src/feature_module/project/project.service';

@Injectable()
export class RequestClosingService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(RequestProjectClosing.name) private requestClosingModel: Model<RequestProjectClosing>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private readonly projectService: ProjectService
  ) { }

  async findAll(user: User, projectId?: string): Promise<RequestProjectClosing[]> {
    let currentEmployee = user.employee as Employee;
    let role = (currentEmployee.role as EmployeeRole).name;

    let filter = {}
    if (projectId) {
      if (role == "mandor") {
        let targetProject = await this.projectModel.findOne({ _id: projectId, project_leader: (user.employee as Employee)._id.toString() }).exec();
        if (!targetProject) throw new BadRequestException('Anda tidak dapat mengakses proyek ini');
      }
      filter = { ...filter, requested_from: projectId }
    }

    let targetRequestClosing = await this.requestClosingModel.find(filter)
      .populate(["requested_by", "requested_from", "handled_by"])
      .sort({ requested_at: -1 })
      .exec()
    return targetRequestClosing;
  }

  async findOne(id: string, user: User): Promise<RequestProjectClosing> {
    let currentEmployee = user.employee as Employee;
    let role = (currentEmployee.role as EmployeeRole).name;

    let filter: any = { _id: id }
    let targetRequestClosing = await this.requestClosingModel.findOne(filter).populate(["requested_by", "requested_from", "handled_by"]).exec()

    if (role == "mandor") {
      let projectId = (targetRequestClosing.requested_from as Project)._id.toString()
      let targetProject = await this.projectModel.findOne({ _id: projectId, project_leader: (user.employee as Employee)._id.toString() }).exec();
      if (!targetProject) throw new BadRequestException('Anda tidak dapat mengakses proyek ini');
    }

    return targetRequestClosing;
  }

  async createRequestClosing(requestClosingInput: CreateRequestClosingInput, user: User): Promise<RequestProjectClosing> {
    const { requested_from } = requestClosingInput;

    const targetRequestedProject = await this.projectModel.findById(requested_from).exec();
    if (!targetRequestedProject) {
      throw new BadRequestException('Proyek tidak ditemukan');
    }

    let constraintRequest = await this.requestClosingModel.findOne({ requested_from: requested_from, status: RequestStatus.MENUNGGU }).exec();
    if (constraintRequest) {
      throw new BadRequestException('Permintaan penutupan proyek sudah dilakukan dan perlu menunggu hasil permintaan penutupan sebelumnya');
    }

    if (
      ((user.employee as Employee).role as EmployeeRole).name == "mandor"
      && targetRequestedProject.project_leader.toString() != (user.employee as Employee)._id.toString()) {
      throw new BadRequestException('User tidak diperbolehkan melakukan aksi tersebut');
    }

    const newRequestClosing = await this.requestClosingModel.create({
      ...requestClosingInput,
      requested_by: (user.employee as Employee)._id.toString(),
      requested_at: new Date(),
      status: RequestStatus.MENUNGGU,
      handled_date: null,
      handled_by: null
    });

    return await this.requestClosingModel.findById(newRequestClosing._id).populate(["requested_by", "requested_from", "handled_by"]).exec();
  }

  async updateRequestClosingStatus(id: string, updateRequestStatusInput: UpdateRequestStatusInput, user: User): Promise<RequestProjectClosing> {
    let { status } = updateRequestStatusInput;
    let targetRequestClosing = await this.requestClosingModel.findById(id).exec();
    // check if request cost exist
    if (!targetRequestClosing) {
      throw new NotFoundException('Request closing dengan ID ' + id + ' tidak ditemukan');
    }

    if (targetRequestClosing.status == RequestStatus.DIBATALKAN) {
      throw new BadRequestException('Request Closing tersebut sudah dibatalkan');
    }

    if (targetRequestClosing.status != RequestStatus.MENUNGGU) {
      throw new BadRequestException('Request Closing tersebut sudah ditangani atau telah dibatalkan');
    }

    if (((user.employee as Employee).role as EmployeeRole).name == "mandor") {
      if (targetRequestClosing.requested_by.toString() != (user.employee as Employee)._id.toString() || status != RequestStatus.DIBATALKAN) {
        throw new BadRequestException('User tidak diperbolehkan melakukan aksi tersebut');
      }
    }

    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      if (status == RequestStatus.DISETUJUI) {
        targetRequestClosing.handled_by = (user.employee as Employee)._id;
        targetRequestClosing.handled_date = new Date();

        await this.projectService.createProjectClosing(
          String(targetRequestClosing.requested_from),
          targetRequestClosing.handled_by,
          targetRequestClosing._id,
          session)
      }
      targetRequestClosing.status = status;
      await targetRequestClosing.save({ session });

      await session.commitTransaction();
      return await this.requestClosingModel.findById(id).populate(["requested_by", "requested_from", "handled_by"])
    } catch (error) {
      await session.abortTransaction();
      throw error
    } finally {
      await session.endSession();
    }
  }
}
