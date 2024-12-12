import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WarehouseResolver } from "./warehouse.resolver";
import { WarehouseService } from "./warehouse.service";
import { Warehouse, WarehouseSchema } from "./schema/warehouse.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{name: Warehouse.name, schema: WarehouseSchema}]),
  ],
  providers: [WarehouseResolver, WarehouseService]
})
export class CategoryModule {}
