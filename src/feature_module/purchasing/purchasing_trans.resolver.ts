import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { PurchasingService } from './purchasing.service';
import { PurchasingTransactionService } from './purchase_trans.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PurchaseTransaction } from './schema/purchasing.schema';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CurrentUser } from 'src/common/decorators/auth_user.decorator';
import { User } from '../user/schema/user.schema';
import { CreateNewPurchaseTransactionDetailInput, CreatePurchaseTransactionDetailInput, CreateRequestPurchaseTransactionInput, UpdateRequestPurchaseTransactionInput } from './types/purchasing_types.types';
import { CreateToolInput } from '../inventory/types/tool.types';

@Resolver()
@UseGuards(AppAuthGuard)
export class PurchasingTransactionResolver {
  constructor(
    private readonly purchasingTransactionService: PurchasingTransactionService
  ) { }

  @Query(() => [PurchaseTransaction])
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  async getAllPurchaseTransactions(): Promise<PurchaseTransaction[]> {
    return await this.purchasingTransactionService.getAllPurchaseTransactions();
  }

  @Query(() => [PurchaseTransaction])
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'staff_pembelian')
  async getPurchaseTransactionByUser(
    @CurrentUser() user: User
  ): Promise<PurchaseTransaction[]> {
    return this.purchasingTransactionService.getPurchaseTransactionByPurchasingStaff(user);
  }


  @Query(() => PurchaseTransaction)
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'staff_pembelian')
  async getPurchaseTransactionById(
    @Args('id') id: string,
    @CurrentUser() user: User
  ): Promise<PurchaseTransaction> {
    return this.purchasingTransactionService.getPurchaseTransactionById(id, user);
  }


  @Mutation(() => PurchaseTransaction)
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'staff_pembelian')
  async createPurchaseTransaction(
    @Args('createPurchaseTransactionInput') createPurchaseTransactionInput: CreateRequestPurchaseTransactionInput,
    @CurrentUser() user: User
  ): Promise<PurchaseTransaction> {
    return this.purchasingTransactionService.createPurchaseTransaction(createPurchaseTransactionInput, user);
  }


  @Mutation(() => PurchaseTransaction)
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'staff_pembelian')
  async updatePurchaseTransaction(
    @Args('id') id: string,
    @Args('updatePurchaseTransactionInput') updatePurchaseTransactionInput: UpdateRequestPurchaseTransactionInput,
    @CurrentUser() user: User
  ): Promise<PurchaseTransaction> {
    return this.purchasingTransactionService.update(id, updatePurchaseTransactionInput, user);
  }

  @Mutation(() => PurchaseTransaction)
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'staff_pembelian')
  async removePurchaseTransactionDetail(
    @Args('id') id: string,
    @Args('id_detail') id_detail: string,
    @CurrentUser() user: User
  ): Promise<PurchaseTransaction> {
    return this.purchasingTransactionService.removeDetail(id, id_detail, user);
  }

  @Mutation(() => PurchaseTransaction)
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'staff_pembelian')
  async addNewDetailPT(
    @Args('id') id: string,
    @Args('createPurchaseTransactionDetailInput') createPurchaseTransactionDetailInput: CreateNewPurchaseTransactionDetailInput,
    @CurrentUser() user: User
  ): Promise<PurchaseTransaction> {
    console.log(createPurchaseTransactionDetailInput)
    return this.purchasingTransactionService.addNewDetailPT(id, createPurchaseTransactionDetailInput, user);
  }
}
