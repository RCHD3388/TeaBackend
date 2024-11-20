import { Schema, Document } from 'mongoose';

export interface User extends Document {
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: Date;
}

export const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'user'] },
  createdAt: { type: Date, default: Date.now },
});