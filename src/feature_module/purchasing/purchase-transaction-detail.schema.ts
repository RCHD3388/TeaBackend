import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PurchaseTransactionDetail extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Item', required: true })
  item: string;

  @Prop({ type: String, required: true })
  item_type: string;

  @Prop({ type: Number, required: true })
  qty: number;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  subtotal: number;
}

export const PurchaseTransactionDetailSchema = SchemaFactory.createForClass(PurchaseTransactionDetail);
