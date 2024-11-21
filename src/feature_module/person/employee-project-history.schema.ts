import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Project } from '../../feature_module/project/project.schema'; // Ensure this is imported if referenced in GraphQL

@ObjectType()
@Schema()
export class EmployeeProjectHistory {
  @Field(() => Project) // Expose the reference to Project in GraphQL
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId;

  @Field(() => Date) // Expose the join_at field in GraphQL
  @Prop({ type: Date, required: true })
  join_at: Date;
}

export const EmployeeProjectHistorySchema = SchemaFactory.createForClass(
  EmployeeProjectHistory
);
