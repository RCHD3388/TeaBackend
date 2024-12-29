import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from './../../../feature_module/user/auth_related/auth.guard';
import { MaterialService } from './material.service';
import { Material } from './../schema/inventory.schema';
import { RolesGuard } from './../../../common/guard/roles.guard';
import { Roles } from './../../../common/decorators/roles.decorator';
import { CreateMaterialInput, UpdateMaterialInput } from '../types/material.types';
import { filter } from 'rxjs';
import { FilterInput } from 'src/feature_module/types/global_input_types.types';

@Resolver()
@UseGuards(AppAuthGuard)
export class MaterialResolver {
  constructor(
    private readonly materialService: MaterialService
  ) { }

  @Query(() => [Material], { name: 'getAllMaterials' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian", "mandor")
  async getAllMaterials(
    @Args('filterInput', {nullable: true}) filterInput?: FilterInput
  ) {
    return this.materialService.findAll(filterInput);
  }

  @Query(() => [Material], { name: 'getAllMaterialByIds' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian", "mandor")
  async getAllMaterialByIds(@Args('ids', { type: () => [String] }) ids: string[]): Promise<Material[]> {
    return this.materialService.findByIds(ids);
  }

  @Query(() => Material, { name: 'getMaterialById' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async getMaterialById(@Args('id') id: string): Promise<Material> {
    return this.materialService.findOne(id);
  }

  @Mutation(() => Material)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async createMaterial(
    @Args('createMaterialInput') createMaterialInput: CreateMaterialInput
  ): Promise<Material> {
    return this.materialService.create(createMaterialInput);
  }

  @Mutation(() => Material)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async updateMaterial(
    @Args('id') id: string,
    @Args('updateMaterialInput') updateMaterialInput: UpdateMaterialInput
  ): Promise<Material> {
    return this.materialService.update(id, updateMaterialInput);
  }
}
