import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
@ObjectType()
@Schema({ timestamps: true })
export class ProjectClosing extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  closed_by: string; // Employee who closed the project

  @Prop({ type: String })
  note: string; // Notes about the closure

  @Prop([{ type: Types.ObjectId, ref: 'MaterialTransaction' }])
  material_left: string[]; // Array of material transactions

  @Prop([{ type: Types.ObjectId, ref: 'ToolTransaction' }])
  tool_left: string[]; // Array of tool transactions
}

export const ProjectClosingSchema =
  SchemaFactory.createForClass(ProjectClosing);
