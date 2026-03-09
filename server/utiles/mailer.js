const { Resend } = require("resend");

const getClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
};

const sendEmail = async ({ to, subject, html }) => {
  const fromEmail = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME || "Voting System";
  if (!fromEmail) {
    throw new Error("EMAIL_FROM is not configured");
  }
  const client = getClient();
  await client.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail };
