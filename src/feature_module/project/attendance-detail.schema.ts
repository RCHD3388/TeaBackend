import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AttendanceDetail extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employee: string; // Employee involved

  @Prop({ type: Boolean, required: true })
  check_in: boolean;

  @Prop({ type: Boolean, required: true })
  check_out: boolean;

  @Prop({ type: String })
  note: string; // Additional notes
}

export const AttendanceDetailSchema = SchemaFactory.createForClass(AttendanceDetail);
