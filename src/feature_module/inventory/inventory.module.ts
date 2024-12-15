import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WarehouseResolver } from "./warehouse.resolver";
import { WarehouseService } from "./warehouse.service";
import { Warehouse, WarehouseSchema } from "./schema/warehouse.schema";
import { Project, ProjectSchema } from "../project/schema/project.schema";
import { Material, MaterialSchema, Merk, MerkSchema, Sku, SkuSchema, Tool, ToolSchema, UnitMeasure, UnitMeasureSchema } from "./schema/inventory.schema";
import { InventoryResolver } from "./inventory_category.resolver";
import { UnitMeasureService } from "./unit_measure.service";
import { MerkService } from "./merk.service";
import { MaterialResolver } from "./material/material.resolver";
import { MaterialService } from "./material/material.service";
import { ToolSkuResolver } from "./tool/toolsku.resolver";
import { ToolSkuService } from "./tool/toolsku.service";
import { CategoryData, CategoryDataSchema, TransactionCategory, TransactionCategorySchema } from "../category/schema/category.schema";
import { MaterialTransaction, MaterialTransactionSchema, ToolTransaction, ToolTransactionSchema } from "./schema/inventory_trans.schema";
import { MasterTransactionService } from "./transaction/master_transaction.service";
import { ToolTransactionService } from "./transaction/tool_transaction.service";
import { MaterialTransactionService } from "./transaction/material_transaction.service";
import { TransactionResolver } from "./transaction/transaction.resolver";

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Warehouse.name, schema: WarehouseSchema},
      {name: Project.name, schema: ProjectSchema},
      {name: UnitMeasure.name, schema: UnitMeasureSchema},
      {name: Merk.name, schema: MerkSchema},
      {name: Material.name, schema: MaterialSchema},
      {name: Tool.name, schema: ToolSchema},
      {name: Sku.name, schema: SkuSchema},
      {name: CategoryData.name, schema: CategoryDataSchema},
      {name: MaterialTransaction.name, schema: MaterialTransactionSchema},
      {name: ToolTransaction.name, schema: ToolTransactionSchema},
      {name: TransactionCategory.name, schema: TransactionCategorySchema}
    ]),
  ],
  providers: [WarehouseResolver , WarehouseService,
    InventoryResolver, UnitMeasureService, MerkService,
    MaterialResolver, MaterialService,
    ToolSkuResolver, ToolSkuService,
    TransactionResolver, MasterTransactionService, MaterialTransactionService, ToolTransactionService
  ],
  exports: [WarehouseService]
})
export class InventoryModule {}
