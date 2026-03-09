const { Schema, Types, model } = require("mongoose");

const voteRecordSchema = new Schema(
  {
    election: { type: Types.ObjectId, ref: "Election", required: true },
    voter: { type: Types.ObjectId, ref: "Voter", required: true },
    ballot: { type: Types.ObjectId, ref: "Ballot", required: true },
  },
  { timestamps: true }
);

voteRecordSchema.index({ election: 1, voter: 1 }, { unique: true });

module.exports = model("VoteRecord", voteRecordSchema);
