import { ObjectType, Field } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class EmployeeSkill extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;
}

export const EmployeeSkillSchema = SchemaFactory.createForClass(EmployeeSkill);
