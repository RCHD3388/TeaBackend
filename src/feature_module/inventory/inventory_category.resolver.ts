import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from '../user/auth_related/auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UnitMeasureService } from './unit_measure.service';
import { Merk, UnitMeasure } from './schema/inventory.schema';
import { CreateInventoryCategoryInput, UpdateInventoryCategoryInput } from './types/inventory_category.types';
import { MerkService } from './merk.service';

@Resolver()
@UseGuards(AppAuthGuard)
export class InventoryResolver {
  constructor(
    private readonly unitMeasureService: UnitMeasureService,
    private readonly merkService: MerkService
  ) { }

  // UNIT MEASURE HANDLER RESOLVER
  @Query(() => [UnitMeasure], { name: 'getAllUnitMeasures' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async getAllUnitMeasures() {
    return this.unitMeasureService.findAll();
  }

  @Query(() => UnitMeasure, { name: 'getUnitMeasureById' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async getUnitMeasureById(@Args('id') id: string): Promise<UnitMeasure> {
    return this.unitMeasureService.findOne(id);
  }

  @Mutation(() => UnitMeasure)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async createUnitMeasure(
    @Args('createInventoryCategoryInput') createInventoryCategoryInput: CreateInventoryCategoryInput
  ): Promise<UnitMeasure> {
    return this.unitMeasureService.create(createInventoryCategoryInput);
  }

  @Mutation(() => UnitMeasure)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async updateUnitMeasure(
    @Args('id') id: string,
    @Args('updateInventoryCategoryInput') updateInventoryCategoryInput: UpdateInventoryCategoryInput
  ): Promise<UnitMeasure> {
    return this.unitMeasureService.update(id, updateInventoryCategoryInput);
  }

  @Mutation(() => UnitMeasure)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async deleteUnitMeasure(
    @Args('id') id: string,
  ): Promise<UnitMeasure> {
    return this.unitMeasureService.delete(id);
  }

  // MERK HANDLER RESOLVER
  @Query(() => [Merk], { name: 'getAllMerks' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async getAllMerks() {
    return this.merkService.findAll();
  }

  @Query(() => Merk, { name: 'getMerkById' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async getMerkById(@Args('id') id: string): Promise<Merk> {
    return this.merkService.findOne(id);
  }

  @Mutation(() => Merk)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async createMerk(
    @Args('createInventoryCategoryInput') createInventoryCategoryInput: CreateInventoryCategoryInput
  ): Promise<Merk> {
    return this.merkService.create(createInventoryCategoryInput);
  }

  @Mutation(() => Merk)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async updateMerk(
    @Args('id') id: string,
    @Args('updateInventoryCategoryInput') updateInventoryCategoryInput: UpdateInventoryCategoryInput
  ): Promise<Merk> {
    return this.merkService.update(id, updateInventoryCategoryInput);
  }

  @Mutation(() => Merk)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async deleteMerk(
    @Args('id') id: string,
  ): Promise<Merk> {
    return this.merkService.delete(id);
  }
}
