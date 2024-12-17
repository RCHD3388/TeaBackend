import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestCost } from '../schema/request_cost.schema';
import { CreateRequestCostInput } from '../types/request_cost.types';
import { User } from 'src/feature_module/user/schema/user.schema';
import { CategoryType } from 'src/feature_module/category/schema/category.schema';
import { Project } from 'src/feature_module/project/schema/project.schema';
import { RequestStatus } from '../types/request.types';

@Injectable()
export class ProjectCostService {
  constructor(
    @InjectModel(RequestCost.name) private requestCostModel: Model<RequestCost>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) { }

  async createRequestCost(createRequestCostInput: CreateRequestCostInput, user: User): Promise<RequestCost> {
    let { project_cost_category, requested_from } = createRequestCostInput;

    let targetProjectCostCategory = await this.requestCostModel.findOne({ id: project_cost_category, type: CategoryType.PROJECT_COST }).exec();
    if (!targetProjectCostCategory) {
      throw new BadRequestException('Kategori biaya proyek tidak ditemukan');
    }

    let targetRequestedProject =  await this.projectModel.findById(requested_from).exec();
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
}
