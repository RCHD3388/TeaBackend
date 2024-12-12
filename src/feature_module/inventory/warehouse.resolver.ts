import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from '../user/auth_related/auth.guard';
import { Warehouse, WarehouseType } from './schema/warehouse.schema';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseInput, UpdateWarehouseInput } from './types/warehouse.types';
import { CurrentUser } from 'src/common/decorators/auth_user.decorator';
import { User } from '../user/schema/user.schema';

@Resolver()
@UseGuards(AppAuthGuard)
export class WarehouseResolver {
  constructor(
    private readonly warehouseService: WarehouseService
  ) { }

  @Query(() => [Warehouse], { name: 'getAllWarehouses' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async getAllWarehouses() {
    return this.warehouseService.findAll();
  }

  @Query(() => Warehouse, { name: 'getWarehouseById' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian", "mandor")
  async getWarehouseById(
    @Args('id') id: string,
    @CurrentUser() user: User
  ): Promise<Warehouse> {
    return this.warehouseService.findWarehouseById(id, user);
  }

  @Mutation(() => Warehouse)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async createWarehouse(
    @Args('createWarehouseInput') createWarehouseInput: CreateWarehouseInput
  ): Promise<Warehouse> {
    createWarehouseInput.type = WarehouseType.INVENTORY
    return this.warehouseService.create(createWarehouseInput);
  }

  @Mutation(() => Warehouse)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin")
  async updateWarehouse(
    @Args('id') id: string,
    @Args('updateWarehouseInput') updateWarehouseInput: UpdateWarehouseInput
  ): Promise<Warehouse> {
    return this.warehouseService.update(id, updateWarehouseInput);
  }
}
