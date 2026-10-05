import mongoose, { Schema } from "mongoose";
const FitnessMeasurementSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: String,
      required: true
    },
    weightKg: {
      type: Number,
      required: true,
      min: 20,
      max: 300
    },
    chestCm: {
      type: Number
    },
    waistCm: {
      type: Number
    },
    hipsCm: {
      type: Number
    },
    armsCm: {
      type: Number
    },
    thighsCm: {
      type: Number
    },
    bodyFatPercent: {
      type: Number,
      min: 3,
      max: 60
    },
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);
FitnessMeasurementSchema.index({ userId: 1, date: -1 });
const FitnessMeasurement = mongoose.models.FitnessMeasurement || mongoose.model("FitnessMeasurement", FitnessMeasurementSchema);
export {
  FitnessMeasurement
};
