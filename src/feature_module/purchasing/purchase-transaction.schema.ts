import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PurchaseTransaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  purchasing_staff: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Date, required: true })
  transaction_date: Date;

  @Prop({ type: Number, required: true })
  total: number;

  @Prop({ type: Types.ObjectId, ref: 'Supplier', required: true })
  supplier: string;

  @Prop({ type: Types.ObjectId, ref: 'PurchaseOrder', required: true })
  purchase_order: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'PurchaseTransactionDetail' }] })
  purchase_transaction_detail: string[];
}

export const PurchaseTransactionSchema = SchemaFactory.createForClass(PurchaseTransaction);
