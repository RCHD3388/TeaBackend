import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
@ObjectType()
@Schema()
export class Person extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  phone_number: string;

  @Prop({ type: String, required: true })
  address: string;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
