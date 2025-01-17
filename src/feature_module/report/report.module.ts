// report.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportService } from './report.service';
import {
  Material,
  MaterialSchema,
  Tool,
  ToolSchema,
  Sku,
  SkuSchema,
} from '../inventory/schema/inventory.schema';
import { ReportResolver } from './report.resolver';
import {
  Project,
  ProjectCostLog,
  ProjectCostLogSchema,
  ProjectSchema,
} from '../project/schema/project.schema';
import { Employee, EmployeeSchema } from '../person/schema/employee.schema';
import {
  PurchaseTransaction,
  PurchaseTransactionSchema,
} from '../purchasing/schema/purchasing.schema';
import { Supplier, SupplierSchema } from '../person/schema/supplier.schema';
import { Merk, MerkSchema } from '../inventory/schema/inventory.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema },
      { name: Tool.name, schema: ToolSchema },
      { name: Sku.name, schema: SkuSchema },
      { name: ProjectCostLog.name, schema: ProjectCostLogSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: Merk.name, schema: MerkSchema },
      {
        name: PurchaseTransaction.name,
        schema: PurchaseTransactionSchema,
      },
      { name: Supplier.name, schema: SupplierSchema },
    ]),
  ],
  providers: [ReportService, ReportResolver],
  exports: [ReportService],
})
export class ReportModule {}
