import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WarehouseResolver } from "./warehouse.resolver";
import { WarehouseService } from "./warehouse.service";
import { Warehouse, WarehouseSchema } from "./schema/warehouse.schema";
import { Project, ProjectSchema } from "../project/schema/project.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Warehouse.name, schema: WarehouseSchema},
      {name: Project.name, schema: ProjectSchema}
    ]),
  ],
  providers: [WarehouseResolver, WarehouseService],
  exports: [WarehouseService]
})
export class InventoryModule {}
