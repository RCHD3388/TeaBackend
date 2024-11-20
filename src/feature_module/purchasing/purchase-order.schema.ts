import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PurchaseOrder extends Document {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  requested_from: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  requested_by: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, enum: ['pending', 'approved', 'rejected'], required: true })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  handled_by: string;

  @Prop({ type: Date })
  handled_date: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'PurchaseOrderDetail' }] })
  purchase_order_detail: string[];
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder);
