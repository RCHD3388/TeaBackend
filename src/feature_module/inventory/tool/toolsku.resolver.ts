import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from 'src/feature_module/user/auth_related/auth.guard';
import { Sku } from '../schema/inventory.schema';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ToolSkuService } from './toolsku.service';
import { CreateSkuInput, UpdateSkuInput } from '../types/inventory_category.types';

@Resolver()
@UseGuards(AppAuthGuard)
export class ToolSkuResolver {
  constructor(
    private readonly toolskuService: ToolSkuService
  ) { }

  @Query(() => [Sku], { name: 'getAllSkus' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async getAllSkus() {
    return this.toolskuService.findAll();
  }

  @Query(() => Sku, { name: 'getSkuById' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async getSkuById(@Args('id') id: string): Promise<Sku> {
    return this.toolskuService.findOne(id);
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
}
