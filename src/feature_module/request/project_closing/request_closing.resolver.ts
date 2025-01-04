import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { RequestClosingService } from './request_closing.service';
import { RequestProjectClosing } from '../schema/request_closing.schema';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateRequestClosingInput } from '../types/request_closing.types';
import { CurrentUser } from 'src/common/decorators/auth_user.decorator';
import { User } from 'src/feature_module/user/schema/user.schema';
import { UpdateRequestStatusInput } from '../types/request.types';

@Resolver()
@UseGuards(AppAuthGuard)
export class RequestClosingResolver {
  constructor(
    private readonly requestClosingService: RequestClosingService
  ) { }

  @Mutation(() => RequestProjectClosing)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async createRequestClosing(
    @Args('createRequestClosingInput') createRequestClosingInput: CreateRequestClosingInput,
    @CurrentUser() user: User
  ): Promise<RequestProjectClosing> {
    return this.requestClosingService.createRequestClosing(createRequestClosingInput, user);
  }

  @Query(() => [RequestProjectClosing], { name: 'findAllRequestClosing' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async findAllRequestClosing(
    @CurrentUser() user: User,
    @Args('projectId', { nullable: true }) projectId?: string
  ): Promise<RequestProjectClosing[]> {
    return this.requestClosingService.findAll(user, projectId);
  }

  @Query(() => RequestProjectClosing, { name: 'findOneRequestClosing' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async findOneRequestClosing(
    @CurrentUser() user: User,
    @Args('id') id?: string
  ): Promise<RequestProjectClosing> {
    return this.requestClosingService.findOne(id, user);
  }

  @Mutation(() => RequestProjectClosing, { name: 'updateRequestClosing' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async updateRequestClosing(
    @Args('id') id: string,
    @Args('updateRequestStatusInput') updateRequestStatusInput: UpdateRequestStatusInput,
    @CurrentUser() user: User
  ): Promise<RequestProjectClosing> {
    return this.requestClosingService.updateRequestClosingStatus(id, updateRequestStatusInput, user);
  }
}
