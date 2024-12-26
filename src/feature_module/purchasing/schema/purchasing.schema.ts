import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { CategoryData } from "../../category/schema/category.schema";
import { Warehouse } from "../../inventory/schema/warehouse.schema";
import { Employee } from "../../person/schema/employee.schema";
import { Supplier } from "../../person/schema/supplier.schema";
import { RequestItem_ItemType, RequestStatus } from "../../request/types/request.types";
import { Material, Sku, Tool } from "src/feature_module/inventory/schema/inventory.schema";

@ObjectType()
@Schema()
export class PurchaseOrderSubDetail {
  @Field(() => String)
  @Prop({ type: Types.ObjectId, required: true, ref: "PurchaseTransaction" })
  purchase_transaction: string;

  @Field(() => String)
  @Prop({ type: Types.ObjectId, required: true })
  purchase_transaction_detail: string;

  @Field(() => String, {nullable: true})
  @Prop({ type: Types.ObjectId, required: true, ref: "Tool" })
  tool?: string;

  @Field(() => Number)
  @Prop({ type: Number, required: true })
  quantity: number;
}

@ObjectType()
@Schema()
export class PurchaseOrderDetail {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @Prop({ type: Types.ObjectId, required: true })
  item: string;

  // TAMBAHAN SAJA TIDAK ADA DI COLLECTION
  @Field(() => Material, { nullable: true })
  material: Material;
  @Field(() => Sku, { nullable: true })
  sku: Sku;

  @Field(() => String)
  @Prop({ type: String, enum: RequestItem_ItemType, required: true })
  item_type: string;

  @Field(() => Number)
  @Prop({ type: Number, required: true })
  quantity: number;

  @Field(() => Number)
  @Prop({ type: Number, default: 0 })
  completed_quantity: number;

  @Field(() => [PurchaseOrderSubDetail])
  @Prop({ type: [PurchaseOrderSubDetail], default: [] })
  sub_detail: PurchaseOrderSubDetail[];
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

  @Field(() => [PurchaseOrderDetail])
  @Prop({ type: [PurchaseOrderDetail], required: true })
  purchase_order_detail: PurchaseOrderDetail[];
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder);


// PURCHASE TRANSACTION
@ObjectType()
@Schema()
export class PurchaseTransactionDetail {
  @Field(() => String)
  _id?: string;

  @Field(() => PurchaseOrder)
  @Prop({ type: Types.ObjectId, required: true, ref: 'PurchaseOrder' })
  purchase_order: string | PurchaseOrder;

  @Field(() => String)
  @Prop({ type: Types.ObjectId, required: true })
  item: string;

  // TAMBAHAN SAJA GA ADA DI COLLECTION
  @Field(() => Material, { nullable: true })
  material?: Material;
  @Field(() => Tool, { nullable: true })
  sku?: Tool;

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

  @Field(() => String)
  @Prop({ type: String, required: true })
  transaction_number: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: "" })
  description?: string;

  @Field(() => Date)
  @Prop({ type: Date, required: true })
  transaction_date: Date;

  @Field(() => Number)
  @Prop({ type: Number, required: true })
  total: number;

  @Field(() => Supplier)
  @Prop({ type: Types.ObjectId, required: true, ref: 'Supplier' })
  supplier: string | Supplier;

  @Field(() => [PurchaseTransactionDetail])
  @Prop({ type: [PurchaseTransactionDetail], required: true })
  purchase_transaction_detail: PurchaseTransactionDetail[];
}

export const PurchaseTransactionSchema = SchemaFactory.createForClass(PurchaseTransaction);