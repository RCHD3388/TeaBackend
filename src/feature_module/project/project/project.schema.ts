import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@ObjectType() // <-- Add this decorator
@Schema()
export class Project extends Document {
  @Field(() => ID) // <-- Use GraphQL types
  _id: string;

  @Field()
  @Prop({ type: String, required: true })
  name: string;

  @Field()
  @Prop({ type: String, required: true })
  location: string;

  @Field({ nullable: true })
  @Prop({ type: String })
  description?: string;

  @Field({ nullable: true })
  @Prop({ type: Date })
  created_at?: Date;

  @Field({ nullable: true })
  @Prop({ type: Date })
  target_date?: Date;

  @Field({ nullable: true })
  @Prop({ type: Date })
  finished_at?: Date;

  @Field()
  @Prop({ type: String, enum: ['Penting', 'Biasa', 'Sedang'], required: true })
  priority: string;

  @Field()
  @Prop({
    type: String,
    enum: ['Selesai', 'Proses'],
    required: true,
  })
  status: string;

  // @Field({ nullable: true })
  // @Prop({ type: Types.ObjectId, ref: 'Employee' })
  // project_leader?: Types.ObjectId;

  // @Field(() => [String], { nullable: true })
  // @Prop([{ type: Types.ObjectId, ref: 'Employee' }])
  // worker?: Types.ObjectId[];

  // @Field(() => [String], { nullable: true })
  // @Prop([{ type: Types.ObjectId, ref: 'Attendance' }])
  // attendance?: Types.ObjectId[];

  // @Field({ nullable: true })
  // @Prop({ type: Types.ObjectId, ref: 'ProjectClosing' })
  // project_closing?: Types.ObjectId;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
