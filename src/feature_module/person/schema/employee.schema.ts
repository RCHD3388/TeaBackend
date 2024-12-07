import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Person } from './person.schema';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Project } from '../../project/schema/project.schema';

// EmployeeProjHist - EmpRole - EmptSkill - Employee
export enum EmployeeStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@ObjectType()
@Schema()
export class EmployeeProjectHistory {
  @Field(() => String || Project)
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId | Project

  @Field()
  @Prop({ type: Date, required: true })
  join_at: Date;
}
export const EmployeeProjectHistorySchema = SchemaFactory.createForClass(EmployeeProjectHistory);

@ObjectType()
@Schema()
export class EmployeeRole extends Document {
  @Field(() => String)
  _id: string

  @Field(() => String)
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  name: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  description: string;
}
export const EmployeeRoleSchema = SchemaFactory.createForClass(EmployeeRole)

@ObjectType()
@Schema()
export class EmployeeSkill extends Document {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  name: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  description: string;
}
export const EmployeeSkillSchema = SchemaFactory.createForClass(EmployeeSkill)

@ObjectType()
@Schema()
export class Employee extends Document {
  @Field(() => String)
  _id: string

  @Field(() => String)
  @Prop({ type: String, required: true })
  id: string;

  @Field(() => Person)
  @Prop({ type: Person, required: true })
  person: Person;

  @Field(() => Date)
  @Prop({ type: Date, required: true }) 
  hire_date: Date;

  @Field(() => Number)
  @Prop({ type: Number, required: true })
  salary: number;

  @Field(() => String)
  @Prop({ type: String, required: true, enum: EmployeeStatus})
  status: string;

  @Field(() => EmployeeRole)
  @Prop({ type: String, required: true, ref: "Role" })
  role: string | EmployeeRole;

  @Field(() => [EmployeeProjectHistory])
  @Prop({ type: [EmployeeProjectHistory], required: true })
  project_history: EmployeeProjectHistory[];

  @Field(() => [EmployeeSkill])
  @Prop({ type: [String], required: true, ref: "Skill"})
  skill: string[] | EmployeeSkill[];
}
export const EmployeeSchema = SchemaFactory.createForClass(Employee);

const employeePopulateOption = [
  { path: "role", model: "EmployeeRole", localField: "role", foreignField: "id" },
  { path: "skill", model: "EmployeeSkill", localField: "skill", foreignField: "id" }
]
EmployeeSchema.pre('find', function(next) { this.populate(employeePopulateOption); next(); });
EmployeeSchema.pre('findOne', function(next) { this.populate(employeePopulateOption); next(); });
EmployeeSchema.post('save', async function(doc: any, next) { 
  await doc.populate(employeePopulateOption); next(); 
});
EmployeeSchema.post('findOneAndUpdate', async function(doc: any, next) {
  if (doc) await doc.populate(employeePopulateOption);
  next();
});
EmployeeSchema.post('findOneAndDelete', async function(doc: any, next) {
  if (doc) await doc.populate(employeePopulateOption);
  next();
});
