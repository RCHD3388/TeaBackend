import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Enum untuk type
export enum CategoryType {
  PROJECT_COST="pengeluaran_proyek",
  PRIORITY="prioritas",
  COMPLETION_STATUS="status_penyelesaian",
  ITEM="kategori_item",
  TOOL_STATUS="status_alat"
}

@ObjectType()
@Schema()
export class CategoryData extends Document {
  @Field(() => ID) // Menyertakan _id dalam GraphQL response
  _id: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  name: string;

  @Field(() => String, {nullable: true})
  @Prop({ type: String, default: "" })
  description: string;

  @Field(() => String)
  @Prop({ 
    type: String, 
    required: true, 
    enum: Object.values(CategoryType), // Hanya nilai yang ada di enum yang diperbolehkan
  })
  type: CategoryType;
}

export const CategoryDataSchema = SchemaFactory.createForClass(CategoryData);

@ObjectType()
@Schema()
export class TransactionCategory extends Document {
  @Field(() => ID) // Menyertakan _id dalam GraphQL response
  _id: string;

  @Field(() => String)
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Field(() => String, {nullable: true})
  @Prop({ type: String, default: "" })
  description: string;

  @Field(() => Number)
  @Prop({ type: Number, required: true, default: 0 })
  counter: number;
}

export const TransactionCategorySchema = SchemaFactory.createForClass(TransactionCategory);
