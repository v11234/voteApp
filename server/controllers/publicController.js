const HttpError = require("../models/ErrorModel");
const electionModel = require("../models/electionModel");
const voterModel = require("../models/voterModel");
const candidateModel = require("../models/candidateModel");

const getPublicElections = async (_req, res, next) => {
  try {
    const [elections, totalEligibleVoters] = await Promise.all([
      electionModel.find().select("title description thumbnail voters").lean(),
      voterModel.countDocuments({ isVerified: true, isApproved: true, role: "voter" }),
    ]);

    res.status(200).json({ elections, totalEligibleVoters });
  } catch (error) {
    return next(new HttpError("Error in getting public elections", 422));
  }
};

const getPublicElectionCandidates = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidates = await candidateModel
      .find({ election: id })
      .select("_id fullName voteCount")
      .lean();

    res.status(200).json(candidates);
  } catch (error) {
    return next(new HttpError("Error in getting public election candidates", 422));
  }
};

module.exports = { getPublicElections, getPublicElectionCandidates };
