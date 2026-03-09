const HttpError = require("../models/ErrorModel");
const voterModel = require("../models/voterModel");
const AuditLog = require("../models/AuditLogModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const path = require("path");
const cloudinary = require("../utiles/cloudinary");
const { sendEmail } = require("../utiles/mailer");
const { generateOtp, hashOtp } = require("../utiles/otp");
const { logAudit } = require("../utiles/audit");

const adminEmails = (process.env.ADMIN_EMAILS || "admin@gmail.com,nicolineeyong1@gmail.com")
  .split(",")
  .map((email) => email.trim().toLowerCase());

const isAdminEmail = (email) => adminEmails.includes(String(email ?? "").trim().toLowerCase());

const isStrongPassword = (password) => {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return password.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial;
};

const generateToken = (payload, expiresIn = "1d") => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  return token;
};

const extractBearerToken = (req) => {
  const Authorization = req.headers.Authorization || req.headers.authorization;
  if (!Authorization || !Authorization.startsWith("Bearer")) {
    return null;
  }
  return Authorization.split(" ")[1];
};

const generateIdUploadToken = (id) => generateToken({ id, type: "id-upload" }, "1h");
const generateFaceEnrollToken = (id) => generateToken({ id, type: "face-enroll" }, "15m");

const normalizeOtp = (value) => String(value ?? "").trim().replace(/[\s-]/g, "");

const FACE_EMBEDDING_LENGTH = 256;
const FACE_MATCH_THRESHOLD = Number.parseFloat(process.env.FACE_MATCH_THRESHOLD || "0.82");

const sanitizeFaceEmbedding = (input) => {
  if (!Array.isArray(input)) {
    return null;
  }
  const vector = input.map((v) => Number(v));
  if (vector.length !== FACE_EMBEDDING_LENGTH || vector.some((v) => !Number.isFinite(v))) {
    return null;
  }
  return vector.map((v) => Math.max(-1, Math.min(1, v)));
};

const sanitizeFaceImageData = (value) => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  if (!normalized.startsWith("data:image/")) {
    return null;
  }
  if (normalized.length > 3500000) {
    return null;
  }
  return normalized;
};

const cosineSimilarity = (a, b) => {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) {
    return -1;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

const sendEmailOtp = async (email, otp, context) => {
  const subject =
    context === "login"
      ? "Your admin login verification code"
      : "Verify your email address";
  const html = `
    <p>Your verification code is:</p>
    <h2>${otp}</h2>
    <p>This code expires in 10 minutes.</p>
  `;
  await sendEmail({ to: email, subject, html });
};

const resendEmailOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new HttpError("Email is required", 422));
    }
    const user = await voterModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(new HttpError("User not found", 404));
    }
    if (isAdminEmail(user.email) && user.role !== "admin") {
      user.isAdmin = true;
      user.role = "admin";
      user.isApproved = true;
      user.twoFactorEnabled = true;
      await user.save();
    }
    if (user.isVerified) {
      if (!isAdminEmail(user.email) && user.role === "voter" && user.idVerificationStatus === "not_submitted") {
        const idUploadToken = generateIdUploadToken(user._id);
        return res.status(200).json({
          message: "Email already verified. Please upload your ID card.",
          requiresIdUpload: true,
          idUploadToken,
          email: user.email,
          fullName: user.fullName,
        });
      }
      return res.status(200).json({ message: "Email already verified." });
    }
    const otp = generateOtp();
    user.emailOtpHash = hashOtp(otp);
    user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    try {
      await sendEmailOtp(user.email, otp, "register");
    } catch (err) {
      await logAudit({
        action: "voter.email_otp_send_failed",
        actor: user._id,
        actorRole: user.role,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        meta: { error: err.message },
      });
    }
    await logAudit({
      action: "voter.email_otp_resent",
      actor: user._id,
      actorRole: user.role,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    res.json({ message: "OTP resent. Please check your email." });
  } catch (error) {
    return next(new HttpError("Failed to resend OTP", 422));
  }
};

const registerVoter = async (req, res, next) => {
  try {
    const { fullName, email, password, password2, faceEmbedding, faceImageData } = req.body;

    if (!fullName || !email || !password || !password2) {
      return next(new HttpError("All fields required", 422));
    }

    const sanitizedFaceEmbedding = sanitizeFaceEmbedding(faceEmbedding);
    if (!sanitizedFaceEmbedding) {
      return next(new HttpError("Face scan is required for registration.", 422));
    }

    const sanitizedFaceImageData = sanitizeFaceImageData(faceImageData);
    if (!sanitizedFaceImageData) {
      return next(new HttpError("Face image is required for registration.", 422));
    }

    const newEmail = email.toLowerCase();

    const emailExist = await voterModel.findOne({ email: newEmail });
    if (emailExist) {
      return next(new HttpError("Email already exist", 422));
    }

    if (password !== password2) {
      return next(new HttpError("Password do not match", 422));
    }

    if (!isStrongPassword(password)) {
      return next(
        new HttpError(
          "Password must be at least 8 characters and include upper, lower, number, and special character.",
          422
        )
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let isAdmin = false;
    let role = "voter";
    let isApproved = false;
    let twoFactorEnabled = false;

    if (adminEmails.includes(newEmail)) {
      isAdmin = true;
      role = "admin";
      isApproved = true;
      twoFactorEnabled = true;
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const newVoter = await voterModel.create({
      fullName,
      email: newEmail,
      password: hashedPassword,
      isAdmin,
      role,
      isApproved,
      twoFactorEnabled,
      emailOtpHash: otpHash,
      emailOtpExpires: otpExpires,
      faceEmbedding: sanitizedFaceEmbedding,
      faceImageData: sanitizedFaceImageData,
      faceRecognitionEnabled: true,
      faceEnrolledAt: new Date(),
    });

    try {
      await sendEmailOtp(newEmail, otp, "register");
    } catch (err) {
      await logAudit({
        action: "voter.email_otp_send_failed",
        actor: newVoter._id,
        actorRole: role,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        meta: { error: err.message },
      });
    }

    await logAudit({
      action: "voter.register",
      actor: newVoter._id,
      actorRole: role,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
      email: newEmail,
      requiresApproval: !isApproved,
    });
  } catch (error) {
    return next(new HttpError("Voter registration failed", 422));
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const otp = normalizeOtp(req.body?.otp);
    if (!email || !otp) {
      return next(new HttpError("Email and OTP are required", 422));
    }
    const user = await voterModel.findOne({ email });
    if (!user) {
      return next(new HttpError("User not found", 404));
    }
    if (isAdminEmail(user.email) && user.role !== "admin") {
      user.isAdmin = true;
      user.role = "admin";
      user.isApproved = true;
      user.twoFactorEnabled = true;
      await user.save();
    }
    if (user.isVerified) {
      if (!isAdminEmail(user.email) && user.role === "voter" && user.idVerificationStatus === "not_submitted") {
        const idUploadToken = generateIdUploadToken(user._id);
        return res.status(200).json({
          message: "Email already verified. Please upload your ID card.",
          requiresIdUpload: true,
          idUploadToken,
          email: user.email,
          fullName: user.fullName,
        });
      }
      return res.status(200).json({ message: "Email already verified." });
    }
    if (!user.emailOtpHash || !user.emailOtpExpires || user.emailOtpExpires < Date.now()) {
      return next(new HttpError("OTP expired. Please request a new one.", 422));
    }
    const otpHash = hashOtp(otp);
    if (otpHash !== user.emailOtpHash) {
      return next(new HttpError("Invalid OTP", 422));
    }
    user.isVerified = true;
    user.emailOtpHash = undefined;
    user.emailOtpExpires = undefined;
    await user.save();

    await logAudit({
      action: "voter.email_verified",
      actor: user._id,
      actorRole: user.role,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    if (!isAdminEmail(user.email) && user.role === "voter") {
      const idUploadToken = generateIdUploadToken(user._id);
      return res.json({
        message: "Email verified. Upload your ID card to continue verification.",
        requiresIdUpload: true,
        idUploadToken,
        email: user.email,
        fullName: user.fullName,
      });
    }

    return res.json({
      message: "Email verified. You can now log in.",
      requiresIdUpload: false,
    });
  } catch (error) {
    return next(new HttpError("Email verification failed", 422));
  }
};

const submitIdCard = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return next(new HttpError("Missing ID verification token.", 401));
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload || payload.type !== "id-upload") {
      return next(new HttpError("Invalid ID verification token.", 401));
    }

    const voter = await voterModel.findById(payload.id);
    if (!voter) {
      return next(new HttpError("User not found.", 404));
    }

    if (!voter.isVerified) {
      return next(new HttpError("Email must be verified before ID upload.", 403));
    }

    const { fullName, idNumber } = req.body;
    if (!fullName || !idNumber) {
      return next(new HttpError("Full name and ID number are required.", 422));
    }

    if (!req.files || !req.files.idCard) {
      return next(new HttpError("Please upload an ID card image.", 422));
    }

    const normalizedProvidedName = fullName.trim().toLowerCase();
    const normalizedStoredName = voter.fullName.trim().toLowerCase();
    if (normalizedProvidedName !== normalizedStoredName) {
      return next(new HttpError("Full name does not match registration record.", 422));
    }

    const { idCard } = req.files;
    if (idCard.size > 2 * 1024 * 1024) {
      return next(new HttpError("ID card image is too large. Maximum size is 2MB.", 422));
    }

    let fileName = idCard.name.split(".");
    fileName = `${fileName[0]}${uuid()}.${fileName[fileName.length - 1]}`;
    const filePath = path.join(__dirname, "..", "uploads", fileName);

    await idCard.mv(filePath);

    const uploadResult = await cloudinary.uploader.upload(filePath, { resource_type: "image" });
    if (!uploadResult?.secure_url) {
      return next(new HttpError("Could not upload ID card image.", 422));
    }

    voter.idCardUrl = uploadResult.secure_url;
    voter.idNumber = idNumber.trim();
    voter.idVerificationStatus = "submitted";
    voter.idSubmittedAt = new Date();
    await voter.save();

    await logAudit({
      action: "voter.id_submitted",
      actor: voter._id,
      actorRole: voter.role,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      meta: { idNumber: voter.idNumber.slice(-4) },
    });

    res.json({
      message: "ID card submitted successfully. Await admin approval.",
      idVerificationStatus: voter.idVerificationStatus,
    });
  } catch (error) {
    return next(new HttpError("ID card submission failed.", 422));
  }
};

const loginVoter = async (req, res, next) => {
  try {
    const { email, password, faceEmbedding } = req.body;

    if (!email || !password) {
      return next(new HttpError("All fields required", 422));
    }

    let sanitizedFaceEmbedding = null;
    if (faceEmbedding !== undefined) {
      sanitizedFaceEmbedding = sanitizeFaceEmbedding(faceEmbedding);
      if (!sanitizedFaceEmbedding) {
        return next(new HttpError("Invalid face scan data.", 422));
      }
    }

    const newEmail = email.toLowerCase();
    const voter = await voterModel.findOne({ email: newEmail });
    if (!voter) {
      return next(new HttpError("Invalid credentials.", 422));
    }

    if (isAdminEmail(voter.email) && voter.role !== "admin") {
      voter.isAdmin = true;
      voter.role = "admin";
      voter.isApproved = true;
      voter.twoFactorEnabled = true;
      voter.idVerificationStatus = "verified";
      await voter.save();
    }

    const comparePassword = await bcrypt.compare(password, voter.password);
    if (!comparePassword) {
      return next(new HttpError("Invalid credentials.", 422));
    }

    if (!voter.isVerified) {
      return next(new HttpError("Email not verified.", 403));
    }

    if (voter.role === "voter" && voter.idVerificationStatus === "not_submitted") {
      return next(new HttpError("Upload your ID card to continue verification.", 403));
    }

    if (!voter.isApproved) {
      return next(new HttpError("Account awaiting admin approval.", 403));
    }

    if (!voter.faceRecognitionEnabled || !Array.isArray(voter.faceEmbedding) || voter.faceEmbedding.length !== FACE_EMBEDDING_LENGTH) {
      const faceEnrollToken = generateFaceEnrollToken(voter._id);
      return res.json({
        requiresFaceEnrollment: true,
        faceEnrollToken,
        email: voter.email,
      });
    }

    if (!sanitizedFaceEmbedding) {
      return next(new HttpError("Face scan is required to login.", 422));
    }

    const faceScore = cosineSimilarity(voter.faceEmbedding, sanitizedFaceEmbedding);
    if (faceScore < FACE_MATCH_THRESHOLD) {
      return next(new HttpError("Face verification failed. Please try again with better lighting.", 403));
    }

    if (voter.role === "admin" && voter.twoFactorEnabled) {
      const otp = generateOtp();
      voter.twoFactorOtpHash = hashOtp(otp);
      voter.twoFactorOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await voter.save();
      await sendEmailOtp(voter.email, otp, "login");
      const tempToken = generateToken({ id: voter._id, type: "2fa" }, "10m");
      return res.json({ requires2FA: true, tempToken });
    }

    const { _id: id, isAdmin, role, votedElections } = voter;
    const token = generateToken({ id, isAdmin, role });
    voter.lastLoginAt = new Date();
    await voter.save();

    await logAudit({
      action: "voter.login",
      actor: voter._id,
      actorRole: role,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({ token, id, votedElections, isAdmin, role });
  } catch (error) {
    return next(
      new HttpError("Login failed. Please check your credentials or try again later", 422)
    );
  }
};

const enrollFace = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return next(new HttpError("Missing face enrollment token.", 401));
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload || payload.type !== "face-enroll") {
      return next(new HttpError("Invalid face enrollment token.", 401));
    }

    const sanitizedFaceEmbedding = sanitizeFaceEmbedding(req.body?.faceEmbedding);
    if (!sanitizedFaceEmbedding) {
      return next(new HttpError("Face scan is required for enrollment.", 422));
    }

    const sanitizedFaceImageData = sanitizeFaceImageData(req.body?.faceImageData);
    if (!sanitizedFaceImageData) {
      return next(new HttpError("Face image is required for enrollment.", 422));
    }

    const voter = await voterModel.findById(payload.id);
    if (!voter) {
      return next(new HttpError("User not found.", 404));
    }

    voter.faceEmbedding = sanitizedFaceEmbedding;
    voter.faceImageData = sanitizedFaceImageData;
    voter.faceRecognitionEnabled = true;
    voter.faceEnrolledAt = new Date();
    await voter.save();

    await logAudit({
      action: "voter.face_enrolled",
      actor: voter._id,
      actorRole: voter.role,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return res.json({
      message: "Face enrolled successfully. Please login again.",
      requiresRelogin: true,
    });
  } catch (error) {
    return next(new HttpError("Face enrollment failed.", 422));
  }
};

const verifyAdmin2FA = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return next(new HttpError("Missing 2FA token.", 401));
    }
    const otp = normalizeOtp(req.body?.otp);
    if (!otp) {
      return next(new HttpError("OTP is required.", 422));
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload || payload.type !== "2fa") {
      return next(new HttpError("Invalid 2FA token.", 401));
    }
    const voter = await voterModel.findById(payload.id);
    if (!voter) {
      return next(new HttpError("User not found.", 404));
    }
    if (!voter.twoFactorOtpHash || !voter.twoFactorOtpExpires) {
      return next(new HttpError("2FA code not requested.", 422));
    }
    if (voter.twoFactorOtpExpires < Date.now()) {
      return next(new HttpError("2FA code expired.", 422));
    }
    const otpHash = hashOtp(otp);
    if (otpHash !== voter.twoFactorOtpHash) {
      return next(new HttpError("Invalid 2FA code.", 422));
    }

    voter.twoFactorOtpHash = undefined;
    voter.twoFactorOtpExpires = undefined;
    voter.lastLoginAt = new Date();
    await voter.save();

    const { _id: id, isAdmin, role, votedElections } = voter;
    const jwtToken = generateToken({ id, isAdmin, role });

    await logAudit({
      action: "voter.login_2fa",
      actor: voter._id,
      actorRole: role,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({ token: jwtToken, id, votedElections, isAdmin, role });
  } catch (error) {
    return next(new HttpError("2FA verification failed.", 422));
  }
};

const getVoter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const voter = await voterModel.findById(id).select("-password");
    res.json(voter);
  } catch (error) {
    return next(new HttpError("Couldn't get voter", 404));
  }
};

const getPendingVoters = async (_req, res, next) => {
  try {
    const voters = await voterModel
      .find({ isVerified: true, isApproved: false, role: "voter" })
      .select("-password");
    res.json(voters);
  } catch (error) {
    return next(new HttpError("Couldn't get pending voters", 422));
  }
};

const approveVoter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const voter = await voterModel.findById(id);
    if (!voter) {
      return next(new HttpError("User not found", 404));
    }

    if (voter.role === "voter" && voter.idVerificationStatus === "not_submitted") {
      return next(new HttpError("User must submit ID card before approval.", 422));
    }

    voter.isApproved = true;
    if (voter.idVerificationStatus === "submitted") {
      voter.idVerificationStatus = "verified";
    }
    await voter.save();

    await logAudit({
      action: "admin.approve_voter",
      actor: req.user.id,
      actorRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      meta: { approvedUserId: id },
    });

    res.json({ message: "User approved" });
  } catch (error) {
    return next(new HttpError("Approval failed", 422));
  }
};

const getUsers = async (_req, res, next) => {
  try {
    const users = await voterModel.find().select("-password");
    res.json(users);
  } catch (error) {
    return next(new HttpError("Couldn't get users", 422));
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit);
    res.json(logs);
  } catch (error) {
    return next(new HttpError("Couldn't get audit logs", 422));
  }
};

module.exports = {
  registerVoter,
  verifyEmail,
  submitIdCard,
  loginVoter,
  verifyAdmin2FA,
  enrollFace,
  getVoter,
  resendEmailOtp,
  getPendingVoters,
  approveVoter,
  getUsers,
  getAuditLogs,
};














