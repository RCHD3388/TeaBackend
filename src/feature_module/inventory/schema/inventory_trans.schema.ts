import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class MaterialTransaction extends Document {
  @Field()
  @Prop({ type: String, required: true })
  name: string;
}

@ObjectType()
@Schema({ timestamps: true })
export class ToolTransaction extends Document {
  @Field()
  @Prop({ type: String, required: true })
  name: string;
}