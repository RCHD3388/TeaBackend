import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class Tool extends Document {
  
  @Field()
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Field()
  @Prop({ type: String, required: true })
  name: string;

  @Field({ nullable: true })
  @Prop({ type: String })
  description: string;

  @Field()
  @Prop({ type: String })
  serial_number: string;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  warranty_expiration_date: Date;

  @Field(() => Float)
  @Prop({ type: Number, required: true })
  price: number;

  @Field(() => String)
  @Prop({ type: Types.ObjectId, ref: 'StockKeepingUnit', required: true })
  stock_keeping_unit: Types.ObjectId;

  @Field(() => String)
  @Prop({ type: Types.ObjectId, ref: 'CategoryData', required: true })
  item_category: Types.ObjectId;
}

export const ToolSchema = SchemaFactory.createForClass(Tool);
