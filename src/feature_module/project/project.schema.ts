import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  location: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Date })
  target_date: Date;

  @Prop({ type: Date })
  finished_at: Date;

  @Prop({ type: String, enum: ['low', 'medium', 'high'], required: true })
  priority: string;

  @Prop({ type: String, enum: ['ongoing', 'completed', 'closed'], required: true })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  project_leader: string; // References Employee schema

  @Prop([{ type: Types.ObjectId, ref: 'Employee' }])
  worker: string[]; // Array of Employees

  @Prop([{ type: Types.ObjectId, ref: 'Attendance' }])
  attendance: string[]; // Attendance IDs

  @Prop({ type: Types.ObjectId, ref: 'ProjectClosing' })
  project_closing: string; // Project Closing details
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
