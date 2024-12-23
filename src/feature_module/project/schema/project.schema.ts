import { Field, ObjectType } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CategoryData } from '../../category/schema/category.schema';
import { Employee } from '../../person/schema/employee.schema';
import { RequestCost } from '../../request/schema/request_cost.schema';
import { MaterialTransaction, ToolTransaction } from '../../inventory/schema/inventory_trans.schema';
import { RequestProjectClosing } from '../../request/schema/request_closing.schema';
import { Warehouse } from '../../inventory/schema/warehouse.schema';

// ===== ATTENDANCE MODULE START =====
@ObjectType()
@Schema()
export class AttendanceDetail {
  @Field(() => Employee)
  @Prop({ type: Types.ObjectId, required: true })
  employee: string | Employee;

  @Field(() => Boolean)
  @Prop({ type: Boolean, required: true })
  check_in: boolean;

  @Field(() => Boolean)
  @Prop({ type: Boolean, required: true })
  check_out: boolean;
}
@ObjectType()
@Schema()
export class Attendance {
  @Field(() => Date)
  @Prop({ type: Date, required: true })
  date: Date;

  @Field(() => [AttendanceDetail])
  @Prop({ type: [AttendanceDetail], required: true })
  attendance_detail: AttendanceDetail[];
}
@ObjectType()
@Schema()
export class AttendanceModule {
  @Field(() => String)
  _id: string;

  @Field(() => Date)
  @Prop({ type: Date, required: true })
  start_date: Date;

  @Field(() => Date)
  @Prop({ type: Date, required: true })
  end_date: Date;

  @Field(() => Boolean)
  @Prop({ type: Boolean, default: true })
  submit_status: Boolean;

  @Field(() => String)
  @Prop({ type: String, default: "" })
  description: string;

  @Field(() => [Attendance])
  @Prop({ type: [Attendance], required: true })
  attendance: Attendance[];
}
export const AttendanceModuleSchema = SchemaFactory.createForClass(AttendanceModule);
// ===== ATTENDANCE MODULE END =====

// ===== PROJECT CLOSING START =====
@ObjectType()
@Schema({ timestamps: true })
export class ProjectClosing {
  @Field(() => Employee)
  @Prop({ type: Types.ObjectId, required: true, ref: "Employee" })
  closed_by: String | Employee;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: "" })
  note: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String })
  document: string;

  @Field(() => [MaterialTransaction])
  @Prop({ type: [Types.ObjectId], required: true, ref: "MaterialTransaction" })
  material_used: String[] | MaterialTransaction[];

  @Field(() => RequestProjectClosing)
  @Prop({ type: Types.ObjectId, required: true, ref: "RequestProjectClosing" })
  request_project_closing: String | RequestProjectClosing;
}
// ===== PROJECT CLOSING END =====

@ObjectType()
@Schema({ timestamps: true })
export class Project extends Document {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  name: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  location: string;

  @Field(() => String)
  @Prop({ type: String, default: "" })
  description: string;

  // createdAt using timestamps
  @Field(() => Date)
  createdAt: Date

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  finished_at?: Date;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date, default: null })
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
  worker: String[];

  @Field(() => [AttendanceModule])
  @Prop({ type: [Types.ObjectId], required: true, ref: "AttendanceModule" })
  attendance: string[] | AttendanceModule[];

  @Field(() => String)
  @Prop({ type: Types.ObjectId, ref: "Warehouse"})
  warehouse: String | Warehouse

  @Field(() => ProjectClosing, { nullable: true })
  @Prop({ type: ProjectClosing })
  project_closing?: ProjectClosing;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// PROJECT COST LOG

@ObjectType()
@Schema({ timestamps: true })
export class ProjectCostLog extends Document {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  title: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: "" })
  description?: string;

  @Field(() => Date)
  @Prop({ type: Date, required: true })
  date: Date;

  @Field(() => Number)
  @Prop({ type: Number, required: true })
  price: Number;

  @Field(() => CategoryData)
  @Prop({ type: Types.ObjectId, required: true, ref: "CategoryData" })
  category: String | CategoryData;

  @Field(() => Employee)
  @Prop({ type: Types.ObjectId, required: true, ref: "Employee" })
  created_by: String | Employee;

  @Field(() => Project)
  @Prop({ type: Types.ObjectId, ref: "Employee" })
  project: String | Project;

  @Field(() => RequestCost)
  @Prop({ type: Types.ObjectId, ref: "RequestCost" })
  request_cost: String | RequestCost;
}

export const ProjectCostLogSchema = SchemaFactory.createForClass(ProjectCostLog);
