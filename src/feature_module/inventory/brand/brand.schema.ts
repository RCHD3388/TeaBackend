import { ObjectType, Field } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@ObjectType()  // This is important!
@Schema({ timestamps: true })
export class Brand extends Document {
  @Field()  // Field decorator for GraphQL
  @Prop({ required: true })
  name: string;

  @Field({ nullable: true })  // Make sure to use @Field for GraphQL
  @Prop()
  description: string;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
