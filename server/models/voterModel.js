const { Schema, Types, model } = require("mongoose");

const voterSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    votedElections: [{ type: Types.ObjectId, ref: "Election" }],
    isAdmin: { type: Boolean, default: false },
    role: { type: String, enum: ["voter", "admin"], default: "voter" },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    emailOtpHash: { type: String },
    emailOtpExpires: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorOtpHash: { type: String },
    twoFactorOtpExpires: { type: Date },
    lastLoginAt: { type: Date },
    idCardUrl: { type: String },
    idNumber: { type: String },
    idVerificationStatus: {
      type: String,
      enum: ["not_submitted", "submitted", "verified", "rejected"],
      default: "not_submitted",
    },
    idSubmittedAt: { type: Date },
    faceEmbedding: [{ type: Number }],
    faceImageData: { type: String },
    faceRecognitionEnabled: { type: Boolean, default: false },
    faceEnrolledAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = model("Voter", voterSchema);
