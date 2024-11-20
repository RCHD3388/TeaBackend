import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class EmployeeProjectHistory {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId;

  @Prop({ type: Date, required: true })
  join_at: Date;
}

export const EmployeeProjectHistorySchema =
  SchemaFactory.createForClass(EmployeeProjectHistory);
