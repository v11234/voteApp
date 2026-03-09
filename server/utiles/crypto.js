const crypto = require("crypto");

const MASTER_KEY = process.env.BALLOT_MASTER_KEY || "";

const ensureMasterKey = () => {
  if (!MASTER_KEY || MASTER_KEY.length < 32) {
    throw new Error("BALLOT_MASTER_KEY must be set to a strong value (32+ chars).");
  }
};

const encryptWithMasterKey = (plaintext) => {
  ensureMasterKey();
  const iv = crypto.randomBytes(12);
  const key = crypto.createHash("sha256").update(MASTER_KEY).digest();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
};

const decryptWithMasterKey = (payload) => {
  ensureMasterKey();
  const data = Buffer.from(payload, "base64");
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const text = data.subarray(28);
  const key = crypto.createHash("sha256").update(MASTER_KEY).digest();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);
  return decrypted.toString("utf8");
};

const generateElectionKeyPair = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKey, privateKey };
};

const encryptBallot = (publicKey, payload) => {
  const buffer = Buffer.from(payload, "utf8");
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64");
};

const decryptBallot = (privateKey, encryptedPayload) => {
  const buffer = Buffer.from(encryptedPayload, "base64");
  const decrypted = crypto.privateDecrypt(privateKey, buffer);
  return decrypted.toString("utf8");
};

module.exports = {
  encryptWithMasterKey,
  decryptWithMasterKey,
  generateElectionKeyPair,
  encryptBallot,
  decryptBallot,
};
