const crypto = require("crypto");

const OTP_LENGTH = 6;

const generateOtp = () => {
  const otp = crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
  return otp;
};

const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

module.exports = { generateOtp, hashOtp };
