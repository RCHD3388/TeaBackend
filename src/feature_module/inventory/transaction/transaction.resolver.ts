import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { Sku } from '../schema/inventory.schema';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateSkuInput, UpdateSkuInput } from '../types/inventory_category.types';
import { MaterialTransactionService } from './material_transaction.service';
import { AddOnlyToolTransactionInput, CreateMaterialTransactionInput, CreateToolTransactionInput } from '../types/inventory_trans.types';
import { MaterialTransaction } from '../schema/inventory_trans.schema';
import { ToolService } from '../tool/tool.service';
import { ToolTransactionService } from './tool_transaction.service';

@Resolver()
@UseGuards(AppAuthGuard)
export class TransactionResolver {
  constructor(
    private readonly materialTransactionService: MaterialTransactionService,
    private readonly toolTransactionService: ToolTransactionService
  ) { }

  @Mutation(() => Boolean, {name: 'addInventoryMaterial'})
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async addInventoryMaterial(
    @Args('createMaterialTransactionInput') createMaterialTransactionInput: CreateMaterialTransactionInput
  ): Promise<Boolean> {
    createMaterialTransactionInput.transaction_category = "ADD";
    return this.materialTransactionService.create(createMaterialTransactionInput);
  }

  @Query(() => [MaterialTransaction], { name: 'getWarehouseMaterials' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async getWarehouseMaterials(@Args('warehouse_id') warehouse_id: string): Promise<MaterialTransaction[]> {
    return this.materialTransactionService.getRemainItems(warehouse_id);
  }

  @Mutation(() => Boolean, {name: 'addInventoryTool'})
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async addInventoryTool(
    @Args('addOnlyToolTransactionInput') addOnlyToolTransactionInput: AddOnlyToolTransactionInput
  ): Promise<Boolean> {
    addOnlyToolTransactionInput.transaction_category = "ADD";
    return this.toolTransactionService.addOnlyTool(addOnlyToolTransactionInput);
  }
}
