const AuditLog = require("../models/AuditLogModel");

const logAudit = async ({ action, actor, actorRole, ip, userAgent, meta }) => {
  try {
    await AuditLog.create({
      action,
      actor,
      actorRole,
      ip,
      userAgent,
      meta,
    });
  } catch (error) {
    console.error("Failed to write audit log", error);
  }
};

module.exports = { logAudit };
