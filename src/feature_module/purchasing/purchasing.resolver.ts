import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { PurchasingService } from './purchasing.service';
import { PurchaseOrder, PurchaseTransaction } from './schema/purchasing.schema';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { User } from '../user/schema/user.schema';
import { CurrentUser } from 'src/common/decorators/auth_user.decorator';
import { CreateRequestPOInput, ReceiveItemInput } from './types/purchasing_types.types';
import { RequestStatus } from '../request/types/request.types';

@Resolver()
@UseGuards(AppAuthGuard)
export class PurchasingResolver {
  constructor(
    private readonly purchasingService: PurchasingService
  ) { }

  @Query(() => [PurchaseOrder])
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', "staff_pembelian")
  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    return this.purchasingService.getAllPurchaseOrders();
  }

  @Query(() => [PurchaseOrder])
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'mandor', "staff_pembelian")
  async getPurchaseOrderByUser(@CurrentUser() user: User): Promise<PurchaseOrder[]> {
    return this.purchasingService.getPurchaseOrderByUser(user);
  }
  
  @Query(() => PurchaseOrder)
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'mandor', "staff_pembelian")
  async getPurchaseOrderByID(
    @Args('id') id: string,
    @CurrentUser() user: User
  ): Promise<PurchaseOrder> {
    return this.purchasingService.getPurchaseOrderById(id, user);
  }
  
  @Query(() => [PurchaseTransaction])
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'mandor')
  async getRelatedPTfromPO(
    @Args('id') id: string,
    @CurrentUser() user: User
  ): Promise<PurchaseTransaction[]> {
    return this.purchasingService.getRelatedPTfromPO(id, user);
  }
  
  @Mutation(() => PurchaseOrder)
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'mandor')
  async createPurchaseOrder(
    @Args('createPurchaseOrderInput') createPurchaseOrderInput: CreateRequestPOInput,
    @CurrentUser() user: User
  ): Promise<PurchaseOrder> {
    return this.purchasingService.createPurchaseOrder(createPurchaseOrderInput, user);
  }
  
  @Mutation(() => PurchaseOrder)
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  async handleWaitingPO(
    @Args('id') id: string,
    @Args('status') status: RequestStatus
  ): Promise<PurchaseOrder> {
    return this.purchasingService.handleWaitingPO(id, status);
  }
  
  @Mutation(() => PurchaseOrder)
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'mandor')
  async handleReceivedPODetail(
    @Args('id') id: string,
    @Args('receiveItemInput') receiveItemInput: ReceiveItemInput,
    @CurrentUser() user: User
  ): Promise<PurchaseOrder> {
    return this.purchasingService.handleReceivedPODetail(id, receiveItemInput, user);
  }
}
