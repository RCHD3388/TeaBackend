import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Enum untuk type
export enum CategoryType {
  PROJECT_COST="project_cost",
  PRIORITY="“priority”",
  COMPLETION_STATUS="“completion_status”",
  ITEM="“item”",
  ATTENDANCE_STATUS="“attendance_status”",
  PERSON_STATUS="“person_status”",
}

@ObjectType()
@Schema()
export class CategoryData extends Document {
  @Field(() => String)
  @Prop({ type: String, required: true })
  name: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  description: string;

  @Field(() => String)
  @Prop({ 
    type: String, 
    required: true, 
    enum: Object.values(CategoryType), // Hanya nilai yang ada di enum yang diperbolehkan
  })
  type: CategoryType;
}

export const CategoryDataSchema = SchemaFactory.createForClass(CategoryData);
