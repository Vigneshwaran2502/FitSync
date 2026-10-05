import mongoose, { Schema } from "mongoose";
const QRSessionSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    gymLatitude: {
      type: Number,
      required: true
    },
    gymLongitude: {
      type: Number,
      required: true
    },
    maxRadiusMeters: {
      type: Number,
      default: 1e3
    }
  },
  {
    timestamps: true
  }
);
const QRSession = mongoose.models.QRSession || mongoose.model("QRSession", QRSessionSchema);
export {
  QRSession
};
