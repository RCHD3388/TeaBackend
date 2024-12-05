import { Field, ObjectType } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class Project extends Document {

  @Field()
  @Prop({ type: String, required: true })
  name: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
