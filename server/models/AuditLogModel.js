const { Schema, Types, model } = require("mongoose");

const auditLogSchema = new Schema(
  {
    action: { type: String, required: true },
    actor: { type: Types.ObjectId, ref: "Voter" },
    actorRole: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    meta: { type: Object },
  },
  { timestamps: true }
);

module.exports = model("AuditLog", auditLogSchema);
