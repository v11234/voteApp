const { Schema, Types, model } = require("mongoose");

const ballotSchema = new Schema(
  {
    election: { type: Types.ObjectId, ref: "Election", required: true },
    encryptedVote: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = model("Ballot", ballotSchema);
