import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ type: String, required: true })
  name: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
