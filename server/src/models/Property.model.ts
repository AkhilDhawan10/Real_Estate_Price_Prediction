import mongoose, { Document, Schema } from 'mongoose';

export type PropertyType = 'plot' | 'flat';
export type FloorType = 'basement' | 'ground' | 'first' | 'second' | 'third' | 'terrace' | 'stilt';
export type PropertyStatus = 'ready' | 'under_construction' | 'booking';

export interface IProperty extends Document {
  location: {
    city: string;
    area: string;
  };
  propertyId?: string;
  propertyType: PropertyType;
  size: {
    value: number;
    unit: 'gaj' | 'sqft' | 'yd';
  };
  price?: number;
  floors: FloorType[];
  bedrooms?: number;
  status?: PropertyStatus;
  contact?: string;
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
    propertyId: {
      type: String,
      trim: true,
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
        enum: ['gaj', 'sqft', 'yd'],
        required: true,
      },
    },
    price: {
      type: Number,
    },
    floors: {
      type: [String],
      enum: ['basement', 'ground', 'first', 'second', 'third', 'terrace', 'stilt'],
      default: [],
    },
    bedrooms: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['ready', 'under_construction', 'booking'],
    },
    contact: {
      type: String,
      trim: true,
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
PropertySchema.index({ floors: 1 });
PropertySchema.index({ bedrooms: 1 });

export default mongoose.model<IProperty>('Property', PropertySchema);

