import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
@ObjectType()
@Schema()
export class Supplier extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Person', required: true })
  person: Types.ObjectId; // Reference to Person

  @Prop({ type: String, required: true })
  status: string;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
