import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { RequestCost } from '../schema/request_cost.schema';
import { CreateRequestCostInput, UpdateRequestCostStatusInput } from '../types/request_cost.types';
import { User } from 'src/feature_module/user/schema/user.schema';
import { CategoryType } from 'src/feature_module/category/schema/category.schema';
import { Project } from 'src/feature_module/project/schema/project.schema';
import { RequestStatus } from '../types/request.types';
import { Employee, EmployeeRole, EmployeeRoleSchema } from 'src/feature_module/person/schema/employee.schema';
import { ProjectCostService } from 'src/feature_module/project/project_att_cost/project_cost.service';

@Injectable()
export class RequestCostService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(RequestCost.name) private requestCostModel: Model<RequestCost>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private readonly projectCostService: ProjectCostService
  ) { }

  async findAll(user: User, projectId?: string): Promise<RequestCost[]> {
    let currentEmployee = user.employee as Employee;
    let role = (currentEmployee.role as EmployeeRole).name;

    if (role == "mandor" && !projectId) throw new NotFoundException('Request Cost tidak ditemukan');

    let filter = {};
    if (projectId) {
      filter = { requested_from: projectId };
    }

    let targetRequestCosts = await this.requestCostModel.find(filter).populate(["requested_by", "requested_from", "handled_by", "project_cost_category"]).exec()

    return targetRequestCosts;
  }

  async createRequestCost(createRequestCostInput: CreateRequestCostInput, user: User): Promise<RequestCost> {
    let { project_cost_category, requested_from } = createRequestCostInput;

    let targetProjectCostCategory = await this.requestCostModel.findOne({ id: project_cost_category, type: CategoryType.PROJECT_COST }).exec();
    if (!targetProjectCostCategory) {
      throw new BadRequestException('Kategori biaya proyek tidak ditemukan');
    }

    let targetRequestedProject = await this.projectModel.findById(requested_from).exec();
    if (!targetRequestedProject) {
      throw new BadRequestException('Proyek tidak ditemukan');
    }

    let newRequestCost = await this.requestCostModel.create({
      ...createRequestCostInput,
      requested_by: user.employee,
      requested_at: new Date(),
      status: RequestStatus.MENUNGGU
    });
    return newRequestCost
  }

  async updateStatus(id: string, updateRequestCostStatusInput: UpdateRequestCostStatusInput, user: User): Promise<RequestCost> {
    let { status } = updateRequestCostStatusInput;
    let targetRequestCost = await this.requestCostModel.findById(id).exec();
    // check if request cost exist
    if (!targetRequestCost) {
      throw new NotFoundException('Request Cost dengan ID ' + id + ' tidak ditemukan');
    }

    if (targetRequestCost.status == RequestStatus.DIBATALKAN) {
      throw new BadRequestException('Request Cost tersebut sudah dibatalkan');
    }

    if (targetRequestCost.status != RequestStatus.MENUNGGU) {
      throw new BadRequestException('Request Cost tersebut sudah ditangani');
    }



    const session = await this.connection.startSession();

    try {
      await session.startTransaction()

      if (status == RequestStatus.DISETUJUI) {
        targetRequestCost.handled_by = user.employee;
        targetRequestCost.handled_date = new Date();

        await this.projectCostService.createRequestCost({
          title: targetRequestCost.title,
          description: targetRequestCost.description,
          date: targetRequestCost.handled_date,
          price: targetRequestCost.price,
          created_by: String(targetRequestCost.handled_by),
          project: String(targetRequestCost.requested_from),
          category: String(targetRequestCost.project_cost_category),
          request_cost: targetRequestCost._id
        }, session)
      }
      targetRequestCost.status = status;
      await targetRequestCost.save({ session });

      await session.commitTransaction();
      return targetRequestCost
    } catch (error) {
      await session.abortTransaction();
      throw error
    } finally {
      await session.endSession();
    }
  }
}
