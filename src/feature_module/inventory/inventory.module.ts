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
import { CategoryModule } from "../category/category.module";
import { CategoryData, CategoryDataSchema } from "../category/schema/category.schema";

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
      {name: CategoryData.name, schema: CategoryDataSchema}
    ]),
  ],
  providers: [WarehouseResolver , WarehouseService,
    InventoryResolver, UnitMeasureService, MerkService,
    MaterialResolver, MaterialService,
    ToolSkuResolver, ToolSkuService
  ],
  exports: [WarehouseService]
})
export class InventoryModule {}
