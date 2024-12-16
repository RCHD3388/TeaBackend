import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { Sku } from '../schema/inventory.schema';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateSkuInput, UpdateSkuInput } from '../types/inventory_category.types';
import { MaterialTransactionService } from './material_transaction.service';
import { CreateMaterialTransactionInput } from '../types/inventory_trans.types';

@Resolver()
@UseGuards(AppAuthGuard)
export class TransactionResolver {
  constructor(
    private readonly materialTransactionService: MaterialTransactionService
  ) { }

  @Mutation(() => Boolean)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async addInventoryMaterial(
    @Args('createMaterialTransactionInput') createMaterialTransactionInput: CreateMaterialTransactionInput
  ): Promise<Boolean> {
    return this.materialTransactionService.create(createMaterialTransactionInput);
  }

  // @Query(() => Sku, { name: 'getSkuById' })
  // @UseGuards(RolesGuard)
  // @Roles("owner", "admin", "staff_pembelian")
  // async getSkuById(@Args('id') id: string): Promise<Sku> {
  //   return this.toolskuService.findOne(id);
  // }



  // @Mutation(() => Sku)
  // @UseGuards(RolesGuard)
  // @Roles("owner", "admin", "staff_pembelian")
  // async updateSku(
  //   @Args('id') id: string,
  //   @Args('updateSkuInput') updateSkuInput: UpdateSkuInput
  // ): Promise<Sku> {
  //   return this.toolskuService.update(id, updateSkuInput);
  // }
}
