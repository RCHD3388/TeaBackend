import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PurchaseOrderDetail extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Item', required: true })
  item: string;

  @Prop({ type: String, required: true })
  item_type: string;

  @Prop({ type: Number, required: true })
  qty: number;

  @Prop({ type: String, enum: ['pending', 'approved', 'rejected'], required: true })
  status: string;
}

export const PurchaseOrderDetailSchema = SchemaFactory.createForClass(PurchaseOrderDetail);
