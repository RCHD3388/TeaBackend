import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Person } from "./person.schema";
import { Document } from "mongoose";

export enum SupplierStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@ObjectType()
@Schema()
export class Supplier extends Document {
  @Field(() => String)
  _id: string

  @Field(() => String)
  @Prop({ type: String, required: true})
  name: string

  @Field(() => Person)
  @Prop({ type: Person, required: true })
  person: Person;

  @Field(() => String)
  @Prop({ type: String, required: true, enum: SupplierStatus})
  status: string;
}
export const SupplierSchema = SchemaFactory.createForClass(Supplier);