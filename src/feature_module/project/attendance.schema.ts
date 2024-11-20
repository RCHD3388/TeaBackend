import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Attendance extends Document {
  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  created_by: string; // Creator of the attendance record

  @Prop([{ type: Types.ObjectId, ref: 'AttendanceDetail' }])
  attendance_detail: string[]; // Array of Attendance Details
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
