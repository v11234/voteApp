const HttpError = require("../models/ErrorModel");

const requireRole = (role) => {
  return (req, _res, next) => {
    if (!req.user || req.user.role !== role) {
      return next(new HttpError("Forbidden. Insufficient role.", 403));
    }
    next();
  };
};

module.exports = { requireRole };
