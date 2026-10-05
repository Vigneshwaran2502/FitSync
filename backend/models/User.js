import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide full name"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      minlength: 6,
      select: false
      // Don't return password by default
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    role: {
      type: String,
      enum: ["admin", "trainer", "member"],
      default: "member"
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    avatar: {
      type: String,
      default: ""
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    otp: {
      type: String,
      select: false
    },
    otpExpiry: {
      type: Date,
      select: false
    },
    googleId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);
UserSchema.pre("save", async function() {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export {
  User
};
