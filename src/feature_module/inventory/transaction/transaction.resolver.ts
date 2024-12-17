import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { Sku } from '../schema/inventory.schema';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateSkuInput, UpdateSkuInput } from '../types/inventory_category.types';
import { MaterialTransactionService } from './material_transaction.service';
import { AddOnlyToolTransactionInput, CreateMaterialTransactionInput, CreateToolTransactionInput } from '../types/inventory_trans.types';
import { MaterialTransaction, ToolTransaction } from '../schema/inventory_trans.schema';
import { ToolService } from '../tool/tool.service';
import { ToolTransactionService } from './tool_transaction.service';
import { CurrentUser } from 'src/common/decorators/auth_user.decorator';
import { User } from 'src/feature_module/user/schema/user.schema';
import { WarehouseService } from '../warehouse.service';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Resolver()
@UseGuards(AppAuthGuard)
export class TransactionResolver {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly materialTransactionService: MaterialTransactionService,
    private readonly toolTransactionService: ToolTransactionService,
    private readonly warehouseService: WarehouseService
  ) { }

  @Mutation(() => Boolean, { name: 'addInventoryMaterial' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async addInventoryMaterial(
    @Args('createMaterialTransactionInput') createMaterialTransactionInput: CreateMaterialTransactionInput
  ): Promise<Boolean> {
    createMaterialTransactionInput.transaction_category = "ADD";
    
    let session = await this.connection.startSession();

    try {
      session.startTransaction();

      let return_value = await this.materialTransactionService.create(createMaterialTransactionInput, session);
      
      await session.commitTransaction();
      return return_value
    } catch (error) {
      await session.abortTransaction();
      throw error
    } finally {
      session.endSession();
    }
  }

  @Query(() => [MaterialTransaction], { name: 'getWarehouseMaterials' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian", "mandor")
  async getWarehouseMaterials(
    @Args('warehouse_id') warehouse_id: string,
    @CurrentUser() user: User
  ): Promise<MaterialTransaction[]> {
    // check if user is project leader of the project
    await this.warehouseService.findWarehouseById(warehouse_id, user);
    return this.materialTransactionService.getRemainItems(warehouse_id);
  }

  @Mutation(() => Boolean, { name: 'addInventoryTool' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async addInventoryTool(
    @Args('addOnlyToolTransactionInput') addOnlyToolTransactionInput: AddOnlyToolTransactionInput
  ): Promise<Boolean> {
    addOnlyToolTransactionInput.transaction_category = "ADD";

    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      let return_value = this.toolTransactionService.addOnlyTool(addOnlyToolTransactionInput, session);
      
      await session.commitTransaction();
      return return_value
    } catch (error) {
      await session.abortTransaction();
      throw error
    } finally {
      await session.endSession();
    }

  }

  @Query(() => [ToolTransaction], { name: 'getWarehouseTools' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian", "mandor")
  async getWarehouseTools(
    @Args('warehouse_id') warehouse_id: string,
    @CurrentUser() user: User
  ): Promise<ToolTransaction[]> {
    // check if user is project leader of the project
    await this.warehouseService.findWarehouseById(warehouse_id, user);
    return this.toolTransactionService.getRemainItems(warehouse_id);
  }
}
