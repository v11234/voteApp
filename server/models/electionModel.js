const { Types, model, Schema } = require("mongoose");

const electionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  publicKey: { type: String, required: true },
  encryptedPrivateKey: { type: String, required: true },
  candidate: { type: [{ type: Types.ObjectId, ref: "Candidate" }], default: [] },
  voters: { type: [{ type: Types.ObjectId, ref: "Voter" }], default: [] },
});

module.exports = model("Election", electionSchema);
