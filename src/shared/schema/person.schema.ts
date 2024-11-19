import { Schema, Document } from 'mongoose';

export const PersonSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String, required: true,
    unique: true
  },
  phone_number: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
});

export interface Person extends Document {
  name: string;
  email: string;
  phone_number: string;
  address: string;
}
