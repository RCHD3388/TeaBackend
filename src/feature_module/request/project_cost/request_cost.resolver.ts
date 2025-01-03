import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RequestCostService } from './request_cost.service';
import { RequestCost } from '../schema/request_cost.schema';
import { CreateRequestCostInput, UpdateRequestCostStatusInput } from '../types/request_cost.types';
import { CurrentUser } from 'src/common/decorators/auth_user.decorator';
import { User } from 'src/feature_module/user/schema/user.schema';
import { UpdateRequestInput } from '../types/request.types';

@Resolver()
@UseGuards(AppAuthGuard)
export class RequestCostResolver {
  constructor(
    private readonly requestCostService: RequestCostService
  ) { }

  @Mutation(() => RequestCost)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async createRequestCost(
    @Args('createRequestCostInput') createRequestCostInput: CreateRequestCostInput,
    @CurrentUser() user: User
  ): Promise<RequestCost> {
    return this.requestCostService.createRequestCost(createRequestCostInput, user);
  }

  @Query(() => RequestCost, { name: 'findOneRequestCost' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async findOneRequestCost(
    @Args('id') id: string,
    @CurrentUser() user: User
  ): Promise<RequestCost> {
    return this.requestCostService.findOne(id, user);
  }


  @Query(() => [RequestCost], { name: 'findAllRequestCosts' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async findAllRequestCosts(
    @CurrentUser() user: User
  ): Promise<RequestCost[]> {
    return this.requestCostService.findAll(user);
  }

  @Mutation(() => RequestCost, { name: 'updateRequestCost' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async updateRequestCost(
    @Args('id') id: string,
    @Args('updateRequestCostStatusInput') updateRequestCostStatusInput: UpdateRequestCostStatusInput,
    @CurrentUser() user: User
  ): Promise<RequestCost> {
    return this.requestCostService.updateStatus(id, updateRequestCostStatusInput, user);
  }

  
  @Mutation(() => RequestCost, { name: 'updateRequestCostDetail' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async updateRequestCostDetail(
    @Args('id') id: string,
    @Args('updateRequestInput') updateRequestInput: UpdateRequestInput,
    @CurrentUser() user: User
  ): Promise<RequestCost> {
    return this.requestCostService.update(id, updateRequestInput, user);
  }
}
