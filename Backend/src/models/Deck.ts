import mongoose, { Document, Schema } from 'mongoose';

export interface IDeck extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  tags: string[];
  createdAt: Date;
}

const DeckSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  tags: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.model<IDeck>('Deck', DeckSchema);
