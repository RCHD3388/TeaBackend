import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EmployeeSkill, EmployeeSkillSchema } from './employee-skill.schema';
import { EmployeeProjectHistory, EmployeeProjectHistorySchema } from './employee-project-history.schema';

@Schema()
export class Employee extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Person', required: true })
  person: Types.ObjectId; // Reference to Person

  @Prop({ type: Date, required: true })
  hire_date: Date;

  @Prop({ type: Number, required: true })
  salary: number;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeRole', required: true })
  role: Types.ObjectId; // Reference to EmployeeRole

  @Prop({ type: [EmployeeProjectHistorySchema], required: true })
  project_history: EmployeeProjectHistory[];

  @Prop({ type: [EmployeeSkillSchema], required: true })
  skill: EmployeeSkill[];
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
