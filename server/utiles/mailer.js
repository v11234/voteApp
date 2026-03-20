const nodemailer = require("nodemailer");

const createTransporter = () => {
  const user = String(process.env.EMAIL_USER || "").trim();
  const rawPass = String(process.env.EMAIL_PASS || "").trim();
  const pass = rawPass.replace(/\s+/g, "");
  const fromEmail = String(process.env.EMAIL_FROM || "").trim();
  const fromName = String(process.env.EMAIL_FROM_NAME || "Voting System").trim();
  const host = String(process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = Number.parseInt(String(process.env.SMTP_PORT || "587").trim(), 10);
  const secure =
    String(process.env.SMTP_SECURE || (port === 465 ? "true" : "false")).trim().toLowerCase() === "true";

  if (!user || !pass) {
    throw new Error("EMAIL_USER and EMAIL_PASS environment variables are required for Nodemailer (Gmail SMTP).");
  }
  if (!fromEmail) {
    throw new Error("EMAIL_FROM is not configured.");
  }
  if (!host || Number.isNaN(port)) {
    throw new Error("SMTP_HOST and SMTP_PORT must be valid.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user,
      pass,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const fromEmail = String(process.env.EMAIL_FROM || "").trim();
  const fromName = String(process.env.EMAIL_FROM_NAME || "Voting System").trim();

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: String(to || "").trim(),
    subject,
    html,
  });
};

module.exports = { sendEmail };
