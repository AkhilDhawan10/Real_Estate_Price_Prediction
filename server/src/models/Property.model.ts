import mongoose, { Document, Schema } from 'mongoose';

export type PropertyType = 'plot' | 'flat';

export interface IProperty extends Document {
  location: {
    city: string;
    area: string;
  };
  propertyType: PropertyType;
  size: {
    value: number;
    unit: 'gaj' | 'sqft';
  };
  price: number;
  brokerNotes?: string;
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
    propertyType: {
      type: String,
      enum: ['plot', 'flat'],
      required: true,
    },
    size: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ['gaj', 'sqft'],
        required: true,
      },
    },
    price: {
      type: Number,
      required: true,
    },
    brokerNotes: {
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
PropertySchema.index({ propertyType: 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ 'size.value': 1 });

export default mongoose.model<IProperty>('Property', PropertySchema);

