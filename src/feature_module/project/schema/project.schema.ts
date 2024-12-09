import { Field, ObjectType } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CategoryData } from 'src/feature_module/category/schema/category.schema';
import { Employee } from 'src/feature_module/person/schema/employee.schema';

@ObjectType()
@Schema()
export class AttendanceDetail {
  @Field(() => Employee)
  @Prop({ type: Types.ObjectId, required: true })
  employee: string | Employee;

  @Field(() => Boolean)
  @Prop({ type: Boolean, required: true, default: false })
  check_in: boolean;

  @Field(() => Boolean)
  @Prop({ type: Boolean, required: true, default: false })
  check_out: boolean;

  @Field(() => String)
  @Prop({ type: String, required: true,  default: "" })
  note: string;
}
@ObjectType()
@Schema()
export class Attendance extends Document {
  @Field(() => Date)
  @Prop({ type: Date, required: true })
  date: Date;

  @Field(() => String)
  @Prop({ type: String, required: true })
  description: string;

  @Field(() => Employee)
  @Prop({ type: Types.ObjectId, required: true })
  created_by: string | Employee;

  @Field(() => [AttendanceDetail])
  @Prop({ type: [Types.ObjectId], required: true, ref: "AttendanceDetail" })
  attendance_detail: string[] | AttendanceDetail[];
}

@ObjectType()
@Schema({ timestamps: true })
export class ProjectClosing {
  @Field(() => Employee)
  @Prop({ type: Types.ObjectId, required: true, ref: "Employee" })
  closed_by: string | Employee;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, required: true, default: "" })
  note: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, required: true, default: "" })
  document: string;
}

@ObjectType()
@Schema({ timestamps: true })
export class Project extends Document {
  @Field(() => String)
  @Prop({ type: String, required: true })
  name: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  location: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  description: string;

  // createdAt using timestamps

  @Field(() => Date, {nullable: true})
  @Prop({ type: Date })
  finished_at?: Date;

  @Field(() => Date, {nullable: true})
  @Prop({ type: Date })
  target_date?: Date;

  @Field(() => CategoryData)
  @Prop({ type: Types.ObjectId, required: true, ref: "CategoryData" })
  priority: String | CategoryData;

  @Field(() => CategoryData)
  @Prop({ type: Types.ObjectId, required: true, ref: "CategoryData" })
  status: String | CategoryData;

  @Field(() => Employee)
  @Prop({ type: Types.ObjectId, required: true, ref: "Employee" })
  project_leader: String | Employee;

  @Field(() => [Employee])
  @Prop({ type: [Types.ObjectId], required: true, ref: "Employee" })
  worker: String[] | Employee[];

  @Field(() => [Attendance])
  @Prop({ type: [Types.ObjectId], required: true, ref: "Attendance" })
  attendace: string[] | Attendance[];

  @Field(() => ProjectClosing, { nullable: true })
  @Prop({ type: ProjectClosing })
  project_closing?: ProjectClosing;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
