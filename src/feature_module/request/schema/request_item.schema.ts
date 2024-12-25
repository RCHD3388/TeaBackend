import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { Material, Tool } from "../../inventory/schema/inventory.schema";
import { Warehouse } from "../../inventory/schema/warehouse.schema";
import { Employee } from "../../person/schema/employee.schema";
import { RequestItem_ItemType, RequestItemType, RequestStatus } from "../types/request.types";

@ObjectType()
@Schema()
export class RequestItemDetail {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @Prop({ type: Types.ObjectId, required: true })
  item: String;

  @Field(() => Number)
  @Prop({ type: Number, required: true })
  quantity: number;

  @Field(() => Number, {nullable: true})
  @Prop({ type: Number, default: 0 })
  price?: number;
  
  @Field(() => String)
  @Prop({ type: String, required: true, enum: RequestItem_ItemType })
  item_type: string;
}

@ObjectType()
@Schema()
export class FinishingDetail {
  @Field(() => String, {nullable: true})
  @Prop({ type: String })
  sender_name?: string;

  @Field(() => String, {nullable: true})
  @Prop({ type: String })
  sender_phone?: string;

  @Field(() => String, {nullable: true})
  @Prop({ type: String })
  police_number?: string;

  @Field(() => String, {nullable: true})
  @Prop({ type: String })
  vehicle_detail?: string;

  @Field(() => String, {nullable: true})
  @Prop({ type: String })
  recipient_name?: string;

  @Field(() => String, {nullable: true})
  @Prop({ type: String })
  recipient_phone?: string;

  @Field(() => String, {nullable: true})
  @Prop({ type: String })
  recipient_description?: string;
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

  @Field(() => Warehouse)
  @Prop({ type: Types.ObjectId, required: true, ref: "Warehouse" })
  requested_to: String | Warehouse;

  @Field(() => String)
  @Prop({ type: String, required: true, enum: RequestStatus })
  status: String;

  @Field(() => FinishingDetail, { nullable: true })
  @Prop({ type: FinishingDetail, default: null })
  finishing_detail?: FinishingDetail;

  @Field(() => [RequestItemDetail])
  @Prop({ type: [RequestItemDetail], required: true })
  request_item_detail?: RequestItemDetail[];
}
export const RequestItemHeaderSchema = SchemaFactory.createForClass(RequestItemHeader);