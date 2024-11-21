import { ObjectType, Field } from '@nestjs/graphql';  // Import GraphQL decorators
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@ObjectType()  // Ensure the class is treated as a GraphQL object
@Schema({ timestamps: true })
export class Warehouse extends Document {
  @Field()  // Field for GraphQL
  @Prop({ type: String, required: true })
  name: string;

  @Field({ nullable: true })  // Optional field in GraphQL
  @Prop({ type: String })
  description: string;

  @Field()  // Required field in GraphQL
  @Prop({ type: String, required: true, default: 'active' })
  status: string;

  @Field()  // Required field in GraphQL
  @Prop({ type: String, required: true })
  address: string;

  @Field(() => String, { nullable: true })  // Optional reference field in GraphQL
  @Prop({ type: Types.ObjectId, ref: 'Project' })
  project: string;

  @Field(() => [String])  // Array of references in GraphQL
  @Prop({ type: [{ type: Types.ObjectId, ref: 'ToolTransaction' }] })
  tool_transaction: string[];

  @Field(() => [String])  // Array of references in GraphQL
  @Prop({ type: [{ type: Types.ObjectId, ref: 'MaterialTransaction' }] })
  material_transaction: string[];
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);
