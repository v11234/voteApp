const { v4: uuid } = require("uuid");
const cloudinary = require("../utiles/cloudinary");
const electionModel = require("../models/electionModel");
const path = require("path");
const HttpError = require("../models/ErrorModel");
const candidateModel = require("../models/candidateModel");
const { generateElectionKeyPair, encryptWithMasterKey } = require("../utiles/crypto");
const { logAudit } = require("../utiles/audit");

const parseElectionDates = (startDate, endDate) => {
  const parsedStart = new Date(startDate);
  const parsedEnd = new Date(endDate);

  if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
    return { error: "Start and end date must be valid dates." };
  }

  if (parsedStart >= parsedEnd) {
    return { error: "End date must be later than start date." };
  }

  return { parsedStart, parsedEnd };
};

const addElection = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return next(new HttpError("Only admin can perform this action", 403));
    }

    const { title, description, startDate, endDate } = req.body;
    if (!title || !description || !startDate || !endDate) {
      return next(new HttpError("Title, description, start date, and end date are required", 422));
    }

    const { parsedStart, parsedEnd, error } = parseElectionDates(startDate, endDate);
    if (error) {
      return next(new HttpError(error, 422));
    }

    if (!req.files || !req.files.thumbnail) {
      return next(new HttpError("Choose a thumbnail", 422));
    }

    const { thumbnail } = req.files;
    if (thumbnail.size > 1000000) {
      return next(new HttpError("file size too big .Should be less than 1mb", 422));
    }

    let fileName = thumbnail.name;
    fileName = fileName.split(".");
    fileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1];

    await thumbnail.mv(path.join(__dirname, "..", "uploads", fileName), async (err) => {
      if (err) {
        return next(new HttpError(err));
      }

      const result = await cloudinary.uploader.upload(
        path.join(__dirname, "..", "uploads", fileName),
        { resource_type: "image" }
      );
      if (!result.secure_url) {
        return next(new HttpError("couldn't upload image to cloudinary", 422));
      }

      const { publicKey, privateKey } = generateElectionKeyPair();
      const encryptedPrivateKey = encryptWithMasterKey(privateKey);
      const newElection = await electionModel.create({
        title,
        description,
        thumbnail: result.secure_url,
        startDate: parsedStart,
        endDate: parsedEnd,
        publicKey,
        encryptedPrivateKey,
      });

      await logAudit({
        action: "admin.election_create",
        actor: req.user.id,
        actorRole: req.user.role,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        meta: { electionId: newElection._id.toString() },
      });

      res.json(newElection);
    });
  } catch (error) {
    return next(new HttpError("Error in creating new election", 422));
  }
};

const getElections = async (req, res, next) => {
  try {
    const elections = await electionModel.find().select("-encryptedPrivateKey");
    res.status(200).json(elections);
  } catch (error) {
    return next(new HttpError("Error in getting all  election", 422));
  }
};

const getElection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const election = await electionModel.findById(id).select("-encryptedPrivateKey");
    res.status(200).json(election);
  } catch (error) {
    return next(new HttpError("Error in getting  election", 422));
  }
};

const getCandidateOfElection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidate = await candidateModel.find({ election: id });
    res.status(200).json(candidate);
  } catch (error) {
    return next(new HttpError("Error in getting  election cadidates", 422));
  }
};

const getElectionVoters = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await electionModel.findById(id).select("voters").populate("voters");
    res.status(200).json(response.voters);
  } catch (error) {
    return next(new HttpError("Error in getting  election voters", 422));
  }
};

const updateElection = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return next(new HttpError("Only admin can perform this action", 403));
    }

    const { id } = req.params;
    const { title, description, startDate, endDate } = req.body;
    if (!title || !description || !startDate || !endDate) {
      return next(new HttpError("Title, description, start date, and end date are required", 422));
    }

    const { parsedStart, parsedEnd, error } = parseElectionDates(startDate, endDate);
    if (error) {
      return next(new HttpError(error, 422));
    }

    if (req.files && req.files.thumbnail) {
      const { thumbnail } = req.files;

      if (thumbnail.size > 1000000) {
        return next(new HttpError("image sise too large", 422));
      }

      let fileName = thumbnail.name;
      fileName = fileName.split(".");
      fileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1];

      await thumbnail.mv(path.join(__dirname, "..", "uploads", fileName), async (err) => {
        if (err) {
          return next(new HttpError(err));
        }

        const result = await cloudinary.uploader.upload(
          path.join(__dirname, "..", "uploads", fileName),
          { resource_type: "image" }
        );
        if (!result.secure_url) {
          return next(new HttpError("couldn't upload image to cloudinary", 422));
        }

        await electionModel.findByIdAndUpdate(id, {
          title,
          description,
          startDate: parsedStart,
          endDate: parsedEnd,
          thumbnail: result.secure_url,
        });

        await logAudit({
          action: "admin.election_update",
          actor: req.user.id,
          actorRole: req.user.role,
          ip: req.ip,
          userAgent: req.headers["user-agent"],
          meta: { electionId: id },
        });
        res.status(200).json("Election updated successfully");
      });
    } else {
      await electionModel.findByIdAndUpdate(id, {
        title,
        description,
        startDate: parsedStart,
        endDate: parsedEnd,
      });

      await logAudit({
        action: "admin.election_update",
        actor: req.user.id,
        actorRole: req.user.role,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        meta: { electionId: id },
      });
      return res.status(200).json("Election updated successfully");
    }
  } catch (error) {
    return next(new HttpError("Error in updating  election ", 422));
  }
};

const removeElection = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return next(new HttpError("Only admin can perform this action", 403));
    }
    const { id } = req.params;
    await electionModel.findByIdAndDelete(id);
    await candidateModel.deleteMany({ election: id });
    await logAudit({
      action: "admin.election_delete",
      actor: req.user.id,
      actorRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      meta: { electionId: id },
    });
    res.status(200).json("Election deleted sucessfully.");
  } catch (error) {
    return next(new HttpError("Error in deleting  election ", 422));
  }
};

module.exports = {
  getCandidateOfElection,
  getElection,
  updateElection,
  removeElection,
  getElectionVoters,
  getElections,
  addElection,
};
