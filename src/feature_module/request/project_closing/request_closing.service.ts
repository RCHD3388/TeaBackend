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

  async findAll(user: User, project_id?: string): Promise<RequestProjectClosing[]> {
    let currentEmployee = user.employee as Employee;
    let role = (currentEmployee.role as EmployeeRole).name;

    if(role == "mandor"){
      if(!project_id) throw new NotFoundException('Request tidak ditemukan');
      let targetProject = await this.projectModel.findById(project_id).exec();
      if(!targetProject) throw new NotFoundException('Project tidak ditemukan');

      if(targetProject.project_leader.toString() != (user.employee as Employee)._id.toString()){
        throw new BadRequestException('User tidak diperbolehkan melakukan aksi tersebut');
      }
    }

    let filter = {};
    if (project_id) {
      filter = { requested_from: project_id };
    }

    let targetRequestClosing = await this.requestClosingModel.find(filter).populate(["requested_by", "requested_from", "handled_by"]).exec()
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
      throw new BadRequestException('Request Closing tersebut sudah ditangani');
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
