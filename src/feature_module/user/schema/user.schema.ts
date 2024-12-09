import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Employee } from 'src/feature_module/person/schema/employee.schema';
import { Field, ObjectType } from '@nestjs/graphql';

export enum UserStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive"
}

@ObjectType()
@Schema()
export class User extends Document {
  @Field(() => String)
  @Prop({ type: String, required: true })
  username: string;

  @Prop({ type: String, required: true })
  password: string;

  @Field(() => String)
  @Prop({ type: String, required: true, enum: UserStatus, default: UserStatus.ACTIVE })
  status: string;

  @Field(() => Employee)
  @Prop({ type: Types.ObjectId, required: true, ref: "Employee" })
  employee: String | Employee;
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

