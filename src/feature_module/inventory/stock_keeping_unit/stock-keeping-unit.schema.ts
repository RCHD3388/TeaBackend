import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@ObjectType() // Marks the class as a GraphQL type
@Schema({ timestamps: true }) // Defines a Mongoose schema with timestamps
export class StockKeepingUnit extends Document {
  @Field(() => ID) // Expose this field in the GraphQL schema as an ID
  _id: string;

  @Field() // Expose this field in the GraphQL schema
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Field() // Expose this field in the GraphQL schema
  @Prop({ type: String, required: true })
  name: string;

  @Field(() => String, { nullable: true }) // Expose this field as a nullable relation
  @Prop({ type: Types.ObjectId, ref: 'Brand' })
  brand: string;

  @Field({ nullable: true }) // Expose this field as optional in the GraphQL schema
  @Prop({ type: String })
  description?: string;
}

export const StockKeepingUnitSchema = SchemaFactory.createForClass(StockKeepingUnit);
