import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EmployeeSkill } from '../employee-skill/employee-skill.schema';
import { EmployeeProjectHistory } from '../employee-project-history.schema';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Person } from '../person.schema';

@Schema()
export class Employee extends Document {
  _id: string;

  @Prop({ type: Types.ObjectId, ref: 'Person', required: true })
  person: Person;

  @Prop({ type: Date, required: true })
  hire_date: Date;

  @Prop({ type: Number, required: true })
  salary: number;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeRole', required: true })
  role: Types.ObjectId;

  @Prop({ type: [Object], required: true })
  skill: EmployeeSkill[];
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
