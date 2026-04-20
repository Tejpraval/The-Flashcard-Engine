import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  cardId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  grade: number; // 1-Again, 2-Hard, 3-Good, 4-Easy
  reviewedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  grade: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
