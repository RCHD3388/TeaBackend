import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/auth_user.decorator';
import { User } from 'src/feature_module/user/schema/user.schema';
import { ProjectAttendService } from './project_attend.service';

@Resolver()
@UseGuards(AppAuthGuard)
export class ProjectAttendResolver {
  constructor(
    private readonly projectAttendService: ProjectAttendService
  ) { }

  // @Mutation(() => RequestCost)
  // @UseGuards(RolesGuard)
  // @Roles("owner", "admin", "mandor")
  // async createRequestCost(
  //   @Args('createRequestCostInput') createRequestCostInput: CreateRequestCostInput,
  //   @CurrentUser() user: User
  // ): Promise<RequestCost> {
  //   return this.requestCostService.createRequestCost(createRequestCostInput, user);
  // }

  // @Query(() => [RequestCost], { name: 'findAllRequestCosts' })
  // @UseGuards(RolesGuard)
  // @Roles("owner", "admin", "mandor")
  // async findAllRequestCosts(
  //   @CurrentUser() user: User,
  //   @Args('projectId', { nullable: true }) projectId?: string
  // ): Promise<RequestCost[]> {
  //   return this.requestCostService.findAll(user, projectId);
  // }

  // @Mutation(() => RequestCost, { name: 'updateRequestCost' })
  // @UseGuards(RolesGuard)
  // @Roles("owner", "admin")
  // async updateRequestCost(
  //   @Args('id') id: string,
  //   @Args('updateRequestCostStatusInput') updateRequestCostStatusInput: UpdateRequestCostStatusInput,
  //   @CurrentUser() user: User
  // ): Promise<RequestCost> {
  //   return this.requestCostService.updateStatus(id, updateRequestCostStatusInput, user);
  // }

}
