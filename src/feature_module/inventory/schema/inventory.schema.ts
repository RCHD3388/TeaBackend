import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { CategoryData } from "../../category/schema/category.schema";

export enum MaterialStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@ObjectType()
@Schema()
export class UnitMeasure extends Document {
  @Field(() => ID) // Menyertakan _id dalam GraphQL response
  _id: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  name: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: "" })
  description?: string;
}
export const UnitMeasureSchema = SchemaFactory.createForClass(UnitMeasure);

@ObjectType()
@Schema()
export class Merk extends Document {
  @Field(() => ID) // Menyertakan _id dalam GraphQL response
  _id: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  name: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: "" })
  description?: string;
}
export const MerkSchema = SchemaFactory.createForClass(Merk);

@ObjectType()
@Schema()
export class Sku extends Document {
  @Field(() => ID) // Menyertakan _id dalam GraphQL response
  _id: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  name: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: "" })
  description?: string;

  @Field(() => Merk)
  @Prop({ type: Types.ObjectId, required: true, ref: "Merk" })
  merk: String | Merk;

  @Field(() => CategoryData)
  @Prop({ type: Types.ObjectId, required: true, ref: "CategoryData" })
  item_category: String | CategoryData;
}
export const SkuSchema = SchemaFactory.createForClass(Sku);

@ObjectType()
@Schema()
export class Material extends Document {
  @Field(() => ID) // Menyertakan _id dalam GraphQL response
  _id: string;

  @Field(() => String)
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  name: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: "" })
  description?: string;

  @Field(() => Merk)
  @Prop({ type: Types.ObjectId, required: true, ref: "Merk" })
  merk: String | Merk;

  @Field(() => UnitMeasure)
  @Prop({ type: Types.ObjectId, required: true, ref: "UnitMeasure" })
  unit_measure: String | UnitMeasure;

  @Field(() => String)
  @Prop({ type: String, required: true, enum: MaterialStatus })
  status: string;

  @Field(() => UnitMeasure)
  @Prop({ type: Types.ObjectId, required: true, ref: "UnitMeasure" })
  minimum_unit_measure: String | UnitMeasure;

  @Field(() => Number)
  @Prop({ type: Number, required: true })
  conversion: number;

  @Field(() => CategoryData)
  @Prop({ type: Types.ObjectId, required: true, ref: "CategoryData" })
  item_category: String | CategoryData;
}
export const MaterialSchema = SchemaFactory.createForClass(Material);

@ObjectType()
@Schema()
export class Tool extends Document {
  @Field(() => ID) // Menyertakan _id dalam GraphQL response
  _id: string;

  @Field(() => String)
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: "" })
  description?: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String })
  warranty_number?: string;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  warranty_expired_date?: Date;

  @Field(() => CategoryData)
  @Prop({ type: Types.ObjectId, required: true, ref: "CategoryData" })
  status: String | CategoryData;

  @Field(() => Number)
  @Prop({ type: Number, required: true, default: 0 })
  price: number;

  @Field(() => Sku)
  @Prop({ type: Types.ObjectId, required: true, ref: "Sku" })
  sku: String | Sku;
}
export const ToolSchema = SchemaFactory.createForClass(Tool);





