import { createUnionType, Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { CategoryData } from "src/feature_module/category/schema/category.schema";
import { Material, Tool } from "src/feature_module/inventory/schema/inventory.schema";
import { Warehouse } from "src/feature_module/inventory/schema/warehouse.schema";
import { Employee } from "src/feature_module/person/schema/employee.schema";
import { Project } from "src/feature_module/project/schema/project.schema";

export enum RequestItemType {
  PEMINJAMAN = 'peminjaman',
  PENGEMBALIAN = 'pengembalian',
}

export enum RequestItem_ItemType {
  MATERIAL = 'Material',
  TOOL = 'Tool',
}

export const MaterialOrTool = createUnionType({
  name: "MaterialOrTool",
  types: () => [Material, Tool] as const,
  resolveType(value) {
    if (value.name) {
      return Material;
    }
    if (value.tool_name) {
      return Tool;
    }
    return null;
  },
});

@ObjectType()
@Schema()
export class RequestItemDetail {
  @Field(() => String)
  _id: string;

  @Field(() => MaterialOrTool)
  @Prop({ type: Types.ObjectId, required: true, refPath: "item_type" })
  item: Material | Tool | String;

  @Field(() => Number)
  @Prop({ type: Number, required: true })
  quantity: number;
  
  @Field(() => String)
  @Prop({ type: String, required: true, enum: RequestItem_ItemType })
  item_type: string;
}

@ObjectType()
@Schema({ timestamps: true })
export class RequestItemHeader extends Document {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  title: string;

  @Field(() => String)
  @Prop({ type: String, required: true, enum: RequestItemType })
  type: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: "" })
  description?: string;

  @Field(() => Warehouse)
  @Prop({ type: Types.ObjectId, required: true, ref: "Warehouse" })
  requested_from: String | Warehouse;

  @Field(() => Employee)
  @Prop({ type: Types.ObjectId, required: true, ref: "Employee" })
  requested_by: String | Employee;

  @Field(() => Date)
  @Prop({ type: Date, default: () => new Date() })
  requested_at: Date;

  @Field(() => [Warehouse])
  @Prop({ type: [Types.ObjectId], required: true, ref: "Warehouse" })
  requested_to: String[] | Warehouse[];

  @Field(() => CategoryData)
  @Prop({ type: Types.ObjectId, required: true, ref: "CategoryData" })
  status: String | CategoryData;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  handled_date?: Date;

  @Field(() => Employee, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: "Employee" })
  handled_by?: String | Employee;

  @Field(() => [RequestItemDetail])
  @Prop({ type: [RequestItemDetail], required: true })
  request_item_detail?: RequestItemDetail[];
}
export const RequestItemHeaderSchema = SchemaFactory.createForClass(RequestItemHeader);