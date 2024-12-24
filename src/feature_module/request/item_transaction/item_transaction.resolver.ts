import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { ItemTransactionService } from './item_transaction.service';
import { RequestItemHeader } from '../schema/request_item.schema';
import { User } from 'src/feature_module/user/schema/user.schema';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/auth_user.decorator';
import { CreateRequestItemInput, CustomRequestItem } from '../types/request_item.types';
import { UpdateRequestStatusInput } from '../types/request.types';

@Resolver()
@UseGuards(AppAuthGuard)
export class ItemTransactionResolver {
  constructor(
    private readonly itemTransactionService: ItemTransactionService
  ) { }

  @Query(() => [RequestItemHeader])
  @UseGuards(RolesGuard)
  @Roles("owner", "admin",)
  async findAllRequestItemTransaction(): Promise<RequestItemHeader[]> {
    return await this.itemTransactionService.findAll();
  }

  @Query(() => [RequestItemHeader])
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async findYourRequestItemTransaction(
    @CurrentUser() user: User
  ): Promise<RequestItemHeader[]> {
    return await this.itemTransactionService.findYourRequest(user);
  }

  @Query(() => [CustomRequestItem])
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async findYourApprovalItemTransaction(
    @CurrentUser() user: User
  ): Promise<CustomRequestItem[]> {
    return await this.itemTransactionService.findYourApproval(user);
  }

  @Mutation(() => RequestItemHeader)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async createRequestItemTransaction(
    @Args('createRequestItemInput') createRequestItemInput: CreateRequestItemInput,
    @CurrentUser() user: User
  ): Promise<RequestItemHeader> {
    return await this.itemTransactionService.createRequestItem(createRequestItemInput, user);
  }

  @Mutation(() => RequestItemHeader, { name: 'updateRequestItem' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async updateRequestItem(
    @Args('id') id: string,
    @Args('updateRequestStatusInput') updateRequestStatusInput: UpdateRequestStatusInput,
    @CurrentUser() user: User
  ): Promise<RequestItemHeader> {
    return this.itemTransactionService.updateRequestItemStatus(id, updateRequestStatusInput, user);
  }
}
