import mongoose, { Document, Schema } from 'mongoose';

export interface IPropertyRequirement extends Document {
  user: mongoose.Types.ObjectId;
  location: {
    city?: string;
    area?: string;
  };
  propertyType?: 'plot' | 'flat';
  size: {
    min?: number;
    max?: number;
    unit?: 'gaj' | 'sqft';
  };
  budget: {
    min: number;
    max: number;
  };
  createdAt: Date;
}

const PropertyRequirementSchema = new Schema<IPropertyRequirement>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      city: String,
      area: String,
    },
    propertyType: {
      type: String,
      enum: ['plot', 'flat'],
    },
    size: {
      min: Number,
      max: Number,
      unit: {
        type: String,
        enum: ['gaj', 'sqft'],
      },
    },
    budget: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

PropertyRequirementSchema.index({ user: 1 });
PropertyRequirementSchema.index({ createdAt: -1 });

export default mongoose.model<IPropertyRequirement>('PropertyRequirement', PropertyRequirementSchema);

