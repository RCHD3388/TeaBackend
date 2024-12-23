import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { CategoryData } from "../../category/schema/category.schema";
import { Warehouse } from "../../inventory/schema/warehouse.schema";
import { Employee } from "../../person/schema/employee.schema";
import { Supplier } from "../../person/schema/supplier.schema";
import { MaterialOrTool, RequestItem_ItemType, RequestStatus } from "../../request/types/request.types";

@ObjectType()
@Schema()
export class PurchaseOrderDetail {
  @Field(() => String)
  _id: string;

  @Field(() => MaterialOrTool)
  @Prop({ type: Types.ObjectId, required: true, refPath: 'item_type' })
  item: string;

  @Field(() => String)
  @Prop({ type: String, enum: RequestItem_ItemType, required: true })
  item_type: string;

  @Field(() => Number)
  @Prop({ type: Number, required: true })
  quantity: number;

  @Field(() => String)
  @Prop({ type: String, required: true, enum: RequestStatus })
  status: String;
}

@ObjectType()
@Schema({ timestamps: true })
export class PurchaseOrder extends Document {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  title: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String })
  description?: string;

  @Field(() => Warehouse)
  @Prop({ type: Types.ObjectId, required: true, ref: 'Warehouse' })
  requested_from: string | Warehouse;

  @Field(() => Employee)
  @Prop({ type: Types.ObjectId, required: true, ref: 'Employee' })
  requested_by: string | Employee;

  @Field(() => Date)
  @Prop({ type: Date, required: true })
  date: Date;

  @Field(() => String)
  @Prop({ type: String, required: true, enum: RequestStatus })
  status: String;

  @Field(() => Employee, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  handled_by?: string | Employee;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  handled_date?: Date;

  @Field(() => [PurchaseOrderDetail])
  @Prop({ type: [PurchaseOrderDetail], required: true })
  purchase_order_detail: PurchaseOrderDetail[];

  @Field(() => [PurchaseTransaction], { nullable: true })
  @Prop({ type: [Types.ObjectId], ref: 'PurchaseTransaction', default: [] })
  purhase_transactions?: string[] | PurchaseTransaction[];
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder);


@ObjectType()
@Schema()
export class PurchaseTransactionDetail {
  @Field(() => String)
  _id: string;

  @Field(() => MaterialOrTool)
  @Prop({ type: Types.ObjectId, required: true, refPath: 'item_type' })
  item: string;

  @Field(() => String)
  @Prop({ type: String, enum: RequestItem_ItemType, required: true })
  item_type: string;

  @Field(() => Number)
  @Prop({ type: Number, required: true })
  quantity: number;

  @Field(() => Number)
  @Prop({ type: Number, required: true })
  price: number;

  @Field(() => Number)
  @Prop({ type: Number, required: true })
  subtotal: number;
}


@ObjectType()
@Schema({ timestamps: true })
export class PurchaseTransaction extends Document {
  @Field(() => String)
  _id: string;

  @Field(() => Employee)
  @Prop({ type: Types.ObjectId, required: true, ref: 'Employee' })
  purchasing_staff: string | Employee;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: "" })
  description?: string;

  @Field(() => Date)
  @Prop({ type: Date, required: true, default: () => new Date() })
  transaction_date: Date;

  @Field(() => Number)
  @Prop({ type: Number, required: true })
  total: number;

  @Field(() => Supplier)
  @Prop({ type: Types.ObjectId, required: true, ref: 'Supplier' })
  supplier: string | Supplier;

  @Field(() => PurchaseOrder)
  @Prop({ type: Types.ObjectId, required: true, ref: 'PurchaseOrder' })
  purchase_order: string | PurchaseOrder;

  @Field(() => [PurchaseTransactionDetail])
  @Prop({ type: [PurchaseTransactionDetail], required: true })
  purchase_transaction_detail: PurchaseTransactionDetail[];
}

export const PurchaseTransactionSchema = SchemaFactory.createForClass(PurchaseTransaction);