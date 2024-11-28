import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Person } from './person.schema';

// EmployeeProjHist - EmpRole - EmptSkill - Employee

@Schema()
export class EmployeeProjectHistory {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId;

  @Prop({ type: Date, required: true })
  join_at: Date;
}
export const EmployeeProjectHistorySchema = SchemaFactory.createForClass(EmployeeProjectHistory);

@Schema()
export class EmployeeRole extends Document {
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;
}
export const EmployeeRoleSchema = SchemaFactory.createForClass(EmployeeRole)

@Schema()
export class EmployeeSkill extends Document {
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;
}
export const EmployeeSkillSchema = SchemaFactory.createForClass(EmployeeSkill)

@Schema()
export class Employee extends Document {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: Person, required: true })
  person: Person;

  @Prop({ type: Date, required: true })
  hire_date: Date;

  @Prop({ type: Number, required: true })
  salary: number;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: String, required: true })
  role: String;

  @Prop({ type: [EmployeeProjectHistory], required: true })
  project_history: EmployeeProjectHistory[];

  @Prop({ type: [String], ref: "EmployeeSkill" })
  skill: String[];
}
export const EmployeeSchema = SchemaFactory.createForClass(Employee);
