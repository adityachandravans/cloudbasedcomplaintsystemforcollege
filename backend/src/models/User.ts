import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'student' | 'staff' | 'hod' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  studentId?: string;
  employeeId?: string;
  department?: string;
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'staff', 'hod', 'admin'], default: 'student' },
    studentId: { type: String, trim: true },
    employeeId: { type: String, trim: true },
    department: { type: String, trim: true },
    phone: { type: String, trim: true },
    profileImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
