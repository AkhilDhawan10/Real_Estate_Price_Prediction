import mongoose, { Document, Schema } from 'mongoose';

export type FloorType = 'basement' | 'ground' | 'first' | 'second' | 'third' | 'terrace' | 'stilt';

export interface IProperty extends Document {
  location: {
    city: string;
    area: string;
  };
  propertyId?: string;
  size?: {
    value: number;
    unit: 'gaj' | 'sqft' | 'yd';
  };
  floors: FloorType[];
  bedrooms?: number;
  detail?: string;
  rawDetail?: string;
  sourcePdf?: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    location: {
      city: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      area: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    },
    propertyId: {
      type: String,
      trim: true,
    },
    size: {
      value: {
        type: Number,
      },
      unit: {
        type: String,
        enum: ['gaj', 'sqft', 'yd'],
      },
    },
    floors: {
      type: [String],
      enum: ['basement', 'ground', 'first', 'second', 'third', 'terrace', 'stilt'],
      default: [],
    },
    bedrooms: {
      type: Number,
    },
    detail: {
      type: String,
      trim: true,
    },
    rawDetail: {
      type: String,
      trim: true,
    },
    sourcePdf: {
      type: String,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient searching
PropertySchema.index({ 'location.city': 1, 'location.area': 1 });
PropertySchema.index({ 'size.value': 1 });
PropertySchema.index({ floors: 1 });
PropertySchema.index({ bedrooms: 1 });

export default mongoose.model<IProperty>('Property', PropertySchema);

