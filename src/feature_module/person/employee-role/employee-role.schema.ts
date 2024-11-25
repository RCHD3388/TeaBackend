import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Schema()
export class EmployeeRole extends Document {
  @Field()
  @Prop({ type: String, required: true })
  name: string;
  @Field()
  @Prop({ type: String, required: true })
  description: string;
}

export const EmployeeRoleSchema = SchemaFactory.createForClass(EmployeeRole);
