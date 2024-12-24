import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { Material, Tool } from "../../inventory/schema/inventory.schema";
import { Warehouse } from "../../inventory/schema/warehouse.schema";
import { Employee } from "../../person/schema/employee.schema";
import { MaterialOrTool, RequestItem_ItemType, RequestItemType, RequestStatus } from "../types/request.types";

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

  @Field(() => String)
  @Prop({ type: String, required: true, enum: RequestStatus })
  status: String;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  handled_date?: Date;

  @Field(() => Employee, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: "Employee" })
  handled_by?: String | Employee;

  @Field(() => Employee, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: "Warehouse" })
  handled_warehouse?: String | Warehouse;

  @Field(() => [RequestItemDetail])
  @Prop({ type: [RequestItemDetail], required: true })
  request_item_detail?: RequestItemDetail[];
}
export const RequestItemHeaderSchema = SchemaFactory.createForClass(RequestItemHeader);