import { ObjectType } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class ToolTransaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Tool', required: true })
  tool: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: Number, default: 0 })
  in: number;

  @Prop({ type: Number, default: 0 })
  out: number;

  @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true })
  warehouse: string;

  @Prop({ type: Types.ObjectId, ref: 'TransactionCategory', required: true })
  transaction_category: string;
}

export const ToolTransactionSchema = SchemaFactory.createForClass(ToolTransaction);
