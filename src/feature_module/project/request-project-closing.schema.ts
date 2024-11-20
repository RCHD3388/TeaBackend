import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RequestProjectClosing extends Document {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  requested_from: string; // Employee to handle the request

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  requested_by: string; // Employee who made the request

  @Prop({ type: Date })
  requested_at: Date;

  @Prop({ type: String, enum: ['pending', 'approved', 'rejected'], required: true })
  status: string;

  @Prop({ type: Date })
  handled_date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  handled_by: string; // Employee who handled the request
}

export const RequestProjectClosingSchema = SchemaFactory.createForClass(RequestProjectClosing);
