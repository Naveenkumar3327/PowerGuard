import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@powerguard/shared-types';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  department?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['ADMIN', 'ENERGY_MANAGER', 'OPERATOR', 'VIEWER'],
      default: 'VIEWER',
      required: true,
    },
    department: { type: String, default: 'Production' },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
