import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  streak: number;
  lastStudyDate?: Date;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  streak: { type: Number, default: 0 },
  lastStudyDate: { type: Date },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
