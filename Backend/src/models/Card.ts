import mongoose, { Document, Schema } from 'mongoose';

export interface ICard extends Document {
  deckId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  difficulty: number;
  topic: string;
  tags: string[];
  sourceReference?: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
}

const CardSchema: Schema = new Schema({
  deckId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  difficulty: { type: Number, default: 1 },
  topic: { type: String },
  tags: { type: [String], default: [] },
  sourceReference: { type: String },
  // SM-2 fields
  easeFactor: { type: Number, default: 2.5 },
  interval: { type: Number, default: 0 },
  repetitions: { type: Number, default: 0 },
  nextReviewDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<ICard>('Card', CardSchema);
