import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestCost } from '../schema/request_cost.schema';
import { CreateRequestCostInput } from '../types/request_cost.types';
import { User } from 'src/feature_module/user/schema/user.schema';
import { CategoryType } from 'src/feature_module/category/schema/category.schema';

@Injectable()
export class ProjectCostService {
  constructor(
    @InjectModel(RequestCost.name) private requestCostModel: Model<RequestCost>,
  ) { }

  // async createRequestCost(createRequestCostInput: CreateRequestCostInput, user: User): Promise<RequestCost> {
  // }
}
