const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({
  actor,
  actorRole,
  action,
  targetType,
  targetId = null,
  description,
  metadata = {},
}) => {
  try {
    return await AuditLog.create({
      actor,
      actorRole,
      action,
      targetType,
      targetId,
      description,
      metadata,
    });
  } catch (error) {
    console.error("AUDIT LOG ERROR:", error.message);
    return null;
  }
};

module.exports = {
  createAuditLog,
};