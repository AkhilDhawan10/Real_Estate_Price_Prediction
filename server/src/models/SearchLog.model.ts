import mongoose, { Document, Schema } from 'mongoose';

export interface ISearchLog extends Document {
  user: mongoose.Types.ObjectId;
  searchParams: {
    city?: string;
    area?: string;
    propertyType?: string;
    sizeMin?: number;
    sizeMax?: number;
    sizeUnit?: string;
    bedrooms?: number;
    floors?: string;
    status?: string;
    budgetMin?: number;
    budgetMax?: number;
  };
  resultsCount: number;
  searchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SearchLogSchema = new Schema<ISearchLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    searchParams: {
      city: { type: String, trim: true, lowercase: true },
      area: { type: String, trim: true, lowercase: true, index: true },
      propertyType: { type: String },
      sizeMin: { type: Number },
      sizeMax: { type: Number },
      sizeUnit: { type: String },
      bedrooms: { type: Number },
      floors: { type: String },
      status: { type: String },
      budgetMin: { type: Number },
      budgetMax: { type: Number },
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
    searchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
SearchLogSchema.index({ searchedAt: -1 });
SearchLogSchema.index({ 'searchParams.area': 1, searchedAt: -1 });

export default mongoose.model<ISearchLog>('SearchLog', SearchLogSchema);
