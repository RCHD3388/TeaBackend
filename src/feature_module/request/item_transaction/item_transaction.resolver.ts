import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { ItemTransactionService } from './item_transaction.service';
import { RequestItemHeader } from '../schema/request_item.schema';
import { User } from 'src/feature_module/user/schema/user.schema';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/auth_user.decorator';
import { CreateFinishingDetailInput, CreateProcessingDetailInput, CreateRequestItemInput, CustomOneRequestItem } from '../types/request_item.types';
import { RequestStatus, UpdateRequestStatusInput } from '../types/request.types';

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

  
  @Query(() => CustomOneRequestItem)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async findOneRequestItemTransaction(
    @Args('id') id: string,
    @CurrentUser() user: User
  ): Promise<CustomOneRequestItem> {
    return await this.itemTransactionService.findOneById(id, user);
  }

  @Query(() => [RequestItemHeader])
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async findYourRequestItemTransaction(
    @CurrentUser() user: User
  ): Promise<RequestItemHeader[]> {
    return await this.itemTransactionService.findYourRequest(user);
  }

  @Query(() => [RequestItemHeader])
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async findYourApprovalItemTransaction(
    @CurrentUser() user: User
  ): Promise<RequestItemHeader[]> {
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

  @Mutation(() => RequestItemHeader, { name: 'cancelItemRequest' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async cancelItemRequest(
    @Args('id') id: string,
    @CurrentUser() user: User
  ): Promise<RequestItemHeader> {
    return this.itemTransactionService.cancelItemRequest(id, user);
  }

  @Mutation(() => RequestItemHeader, { name: 'processingItemRequest' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async processingItemRequest(
    @Args('id') id: string,
    @Args('createProcessingDetailInput') createProcessingDetailInput : CreateProcessingDetailInput,
    @CurrentUser() user: User
  ): Promise<RequestItemHeader> {
    return this.itemTransactionService.processingItemRequest(id, createProcessingDetailInput, user);
  }

  @Mutation(() => RequestItemHeader, { name: 'updateAvailableStatusItemRequest' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async updateAvailableStatusItemRequest(
    @Args('id') id: string,
    @Args('status') status: RequestStatus.DITOLAK | RequestStatus.DISETUJUI,
    @CurrentUser() user: User
  ): Promise<RequestItemHeader> {
    return this.itemTransactionService.updateAvailableStatusItemRequest(id, status, user);
  }

  @Mutation(() => RequestItemHeader, { name: 'closingItemRequest' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "mandor")
  async closingItemRequest(
    @Args('id') id: string,
    @Args('createFinishingDetailInput') createFinishingDetailInput : CreateFinishingDetailInput,
    @CurrentUser() user: User
  ): Promise<RequestItemHeader> {
    return this.itemTransactionService.closedItemRequest(id, createFinishingDetailInput, user);
  }
}
