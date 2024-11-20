import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RequestCost extends Document {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'ProjectCostCategory', required: true })
  project_cost_category: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  requested_from: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  requested_by: string;

  @Prop({ type: Date, required: true })
  requested_at: Date;

  @Prop({ type: String, enum: ['pending', 'approved', 'rejected'], required: true })
  status: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Date })
  handled_date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  handled_by: string;
}

export const RequestCostSchema = SchemaFactory.createForClass(RequestCost);
