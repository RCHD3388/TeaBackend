import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppAuthGuard } from '../user/auth_related/auth.guard';
import { SupplierService } from './supplier.service';
import { Supplier } from './schema/supplier.schema';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateSupplierInput, UpdateSupplierInput } from './types/supplier.types';

@Resolver()
@UseGuards(AppAuthGuard)
export class SupplierResolver {
  constructor(private readonly supplierService: SupplierService) { }

  @Query(() => [Supplier], { name: 'getAllSuppliers' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async getAllSuppliers() {
    return this.supplierService.findAll();
  }

  @Query(() => Supplier, { name: 'getSupplierById' })
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async getSupplierById(@Args('id') id: string): Promise<Supplier> {
    return this.supplierService.findSupplierById(id);
  }

  @Mutation(() => Supplier)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async createSupplier(
    @Args('createSupplierInput') createSupplierInput: CreateSupplierInput
  ): Promise<Supplier> {
    return this.supplierService.create(createSupplierInput);
  }

  @Mutation(() => Supplier)
  @UseGuards(RolesGuard)
  @Roles("owner", "admin", "staff_pembelian")
  async updateSupplier(
    @Args('id') id: string,
    @Args('updateSupplierInput') updateSupplierInput: UpdateSupplierInput
  ): Promise<Supplier> {
    return this.supplierService.update(id, updateSupplierInput);
  }
}
