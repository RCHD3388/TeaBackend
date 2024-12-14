import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { Project } from "src/feature_module/project/schema/project.schema";
import { MaterialTransaction, ToolTransaction } from "./inventory_trans.schema";

export enum WarehouseStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export enum WarehouseType {
  PROJECT = 'Project',
  INVENTORY = 'Inventory',
}

@ObjectType()
@Schema()
export class Warehouse extends Document {
  @Field(() => String)
  _id: string

  @Field(() => String)
  @Prop({ type: String, required: true })
  name: string;

  @Field(() => String, {nullable: true})
  @Prop({ type: String, default: "" })
  description?: string;

  @Field(() => String)
  @Prop({ type: String, required: true, enum: WarehouseType})
  type: string;

  @Field(() => Project, {nullable: true})
  @Prop({ type: Types.ObjectId, ref: "Project" })
  project: string | Project | null;

  @Field(() => String)
  @Prop({ type: String, required: true })
  address: string;
  
  @Field(() => String)
  @Prop({ type: String, required: true, enum: WarehouseStatus, default: WarehouseStatus.ACTIVE })
  status: string;

  @Field(() => [MaterialTransaction])
  @Prop({ type: [Types.ObjectId], required: true, default: [], ref: "MaterialTransaction" })
  material_transaction: String[] | MaterialTransaction[];

  @Field(() => [ToolTransaction])
  @Prop({ type: [Types.ObjectId], required: true, default: [], ref: "ToolTransaction" })
  tool_transaction: String[] | ToolTransaction[];
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);