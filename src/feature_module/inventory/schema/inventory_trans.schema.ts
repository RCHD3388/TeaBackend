import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Date, Document, Types } from 'mongoose';
import { Material, Tool } from "./inventory.schema";
import { Warehouse } from "./warehouse.schema";
import { TransactionCategory } from "../../category/schema/category.schema";

@ObjectType()
@Schema({ timestamps: true })
export class MaterialTransaction extends Document {
  @Field(() => String)
  _id: string

  @Field(() => Material)
  @Prop({ type: Types.ObjectId, required: true, ref: "Material" })
  material: string | Material;

  @Field(() => Number)
  @Prop({ type: Number, required: true, default: 0 })
  in: number;

  @Field(() => Number)
  @Prop({ type: Number, required: true, default: 0 })
  out: number;

  @Field(() => Number)
  @Prop({ type: Number, required: true })
  remain: number;

  @Field(() => Number)
  @Prop({ type: Number, required: true, default: 0 })
  price: number;

  @Field(() => String || Warehouse)
  @Prop({ type: Types.ObjectId, required: true, ref: "Warehouse" })
  warehouse: string | Warehouse;

  @Field(() => String)
  @Prop({ type: String, required: true })
  transaction_code: string;

  @Field(() => TransactionCategory)
  @Prop({ type: Types.ObjectId, required: true, ref: "TransactionCategory" })
  transaction_category: string | TransactionCategory;

  @Field(() => Date)
  @Prop({ type: Date, required: true })
  date: Date;
}
export const MaterialTransactionSchema = SchemaFactory.createForClass(MaterialTransaction);

@ObjectType()
@Schema({ timestamps: true })
export class ToolTransaction extends Document {
  @Field(() => String)
  _id: string

  @Field(() => Tool)
  @Prop({ type: Types.ObjectId, required: true, ref: "Tool" })
  tool: string | Tool;

  @Field(() => Date)
  @Prop({ type: Date, required: true })
  date: Date;

  @Field(() => Number)
  @Prop({ type: Number, required: true, default: 0 })
  in: number;

  @Field(() => Number)
  @Prop({ type: Number, required: true, default: 0 })
  out: number;

  @Field(() => Warehouse || String)
  @Prop({ type: Types.ObjectId, required: true, ref: "Warehouse" })
  warehouse: string | Warehouse;

  @Field(() => String)
  @Prop({ type: String, required: true })
  transaction_code: string;

  @Field(() => TransactionCategory)
  @Prop({ type: Types.ObjectId, required: true, ref: "TransactionCategory" })
  transaction_category: string | TransactionCategory;
}
export const ToolTransactionSchema = SchemaFactory.createForClass(ToolTransaction);