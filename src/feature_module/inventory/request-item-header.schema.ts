import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RequestItemHeader extends Document {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  requested_from: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  requested_by: string;

  @Prop({ type: Date, required: true })
  requested_at: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  requested_to: string;

  @Prop({ type: String, enum: ['pending', 'approved', 'rejected'], required: true })
  status: string;

  @Prop({ type: Date })
  handled_date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  handled_by: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'RequestItemDetail' }] })
  request_item_detail: string[];
}

export const RequestItemHeaderSchema = SchemaFactory.createForClass(RequestItemHeader);
