import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { CategoryData } from "src/feature_module/category/schema/category.schema";
import { Employee } from "src/feature_module/person/schema/employee.schema";
import { Project } from "src/feature_module/project/schema/project.schema";
import { RequestStatus } from "../types/request.types";

@ObjectType()
@Schema({ timestamps: true })
export class RequestProjectClosing extends Document {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  title: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: "" })
  description?: string;

  @Field(() => Project)
  @Prop({ type: Types.ObjectId, required: true, ref: "Project" })
  requested_from: String | Project;

  @Field(() => Employee)
  @Prop({ type: Types.ObjectId, required: true, ref: "Employee" })
  requested_by: String | Employee;

  @Field(() => Date)
  @Prop({ type: Date, default: () => new Date() })
  requested_at: Date;

  @Field(() => String)
  @Prop({ type: String, required: true, enum: RequestStatus })
  status: String;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  handled_date?: Date;

  @Field(() => Employee, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: "Employee" })
  handled_by?: String | Employee;
}

export const RequestProjectClosingSchema = SchemaFactory.createForClass(RequestProjectClosing);