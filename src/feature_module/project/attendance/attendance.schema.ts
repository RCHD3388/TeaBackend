import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

@ObjectType()
@Schema({ timestamps: true })
export class AttendanceDetail extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employee: string;

  @Prop({ type: Boolean, required: true })
  check_in: boolean;

  @Prop({ type: Boolean, required: true })
  check_out: boolean;

  @Prop({ type: String })
  note: string;
}

export const AttendanceDetailSchema =
  SchemaFactory.createForClass(AttendanceDetail);

@ObjectType()
@Schema({ timestamps: true })
export class Attendance extends Document {
  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  created_by: string;

  @Prop([{ type: Types.ObjectId, ref: 'AttendanceDetail' }])
  attendance_detail: Types.ObjectId[];
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
