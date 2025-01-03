import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { Sku, Tool } from '../schema/inventory.schema';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ToolSkuService } from './toolsku.service';
import { CreateSkuInput, UpdateSkuInput } from '../types/inventory_category.types';
import { ToolService } from './tool.service';
import { UpdateToolInput } from '../types/tool.types';
import { FilterInput } from 'src/feature_module/types/global_input_types.types';

@Resolver()
@UseGuards(AppAuthGuard)
export class ToolSkuResolver {
  constructor(
    private readonly toolskuService: ToolSkuService,
    private readonly toolService: ToolService
  ) { }

  @Query(() => [Sku], { name: 'getAllSkus' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian", "mandor")
  async getAllSkus(
    @Args('filter', { nullable: true }) filter?: FilterInput
  ) {
    return this.toolskuService.findAll(filter);
  }

  @Query(() => Sku, { name: 'getSkuById' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async getSkuById(@Args('id') id: string): Promise<Sku> {
    return this.toolskuService.findOne(id);
  }

  @Query(() => [Sku], { name: 'getAllSkusByIds' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian", "mandor")
  async getAllSkusByIds(@Args('ids', { type: () => [String] }) ids: string[]): Promise<Sku[]> {
    return this.toolskuService.findByIds(ids);
  }

  @Mutation(() => Sku)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async createSku(
    @Args('createSkuInput') createSkuInput: CreateSkuInput
  ): Promise<Sku> {
    return this.toolskuService.create(createSkuInput);
  }

  @Mutation(() => Sku)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async updateSku(
    @Args('id') id: string,
    @Args('updateSkuInput') updateSkuInput: UpdateSkuInput
  ): Promise<Sku> {
    return this.toolskuService.update(id, updateSkuInput);
  }
  
  @Mutation(() => Tool)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async updateTool(
    @Args('id') id: string,
    @Args('updateToolInput') updateToolInput: UpdateToolInput
  ): Promise<Tool> {
    return this.toolService.update(id, updateToolInput);
  }

  
  @Query(() => [Tool], { name: 'getAllTools' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian", "mandor")
  async getAllTools(@Args('sku', { nullable: true, type: () => String }) sku?: string): Promise<Tool[]> {
    return this.toolService.findAll(sku);
  }

  @Query(() => Tool, { name: 'getToolById' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async getToolById(@Args('id') id: string): Promise<Tool> {
    return this.toolService.findOne(id);
  }
  
  @Query(() => [Tool], { name: 'getToolsByIds' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian", "mandor")
  async getToolsByIds(@Args('ids', { type: () => [String] }) ids: string[]): Promise<Tool[]> {
    return this.toolService.findByIds(ids);
  }
}
