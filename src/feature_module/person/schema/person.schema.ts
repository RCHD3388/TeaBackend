import { Field, ObjectType } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@ObjectType()
@Schema()
export class Person {
  @Field()
  @Prop({ type: String, required: true })
  name: string;

  @Field()
  @Prop({ type: String, required: true })
  email: string;

  @Field()
  @Prop({ type: String, required: true })
  phone_number: string;

  @Field()
  @Prop({ type: String, required: true })
  address: string;
}
