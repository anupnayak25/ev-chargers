const Location = require("../model/Location");

class HttpError extends Error {
  /** @param {number} status */
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

function isMongoDuplicateKeyError(error) {
  return Boolean(error && typeof error === "object" && error.code === 11000);
}

function findCharger(location, chargerId) {
  const charger = location.chargers.find((c) => c.chargerId === chargerId);
  if (!charger) {
    throw new HttpError(404, "Charger not found");
  }
  return charger;
}

async function findLocation(locationId) {
  const location = await Location.findOne({ locationId });
  if (!location) {
    throw new HttpError(404, "Location not found");
  }
  return location;
}

function wrapRoute(handler, options = {}) {
  const {defaultStatus = 500,defaultMessage = "Server error", exposeErrorMessage = false, duplicateKeyStatus = 409, duplicateKeyMessage = "Already exists",} = options;

  return async function routeHandler(req, res) {
    try {
      await handler(req, res);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({ message: error.message });
      }
      if (isMongoDuplicateKeyError(error)) {
        return res.status(duplicateKeyStatus).json({ message: duplicateKeyMessage });
      }
      const message = exposeErrorMessage && error && error.message ? error.message : defaultMessage;
      return res.status(defaultStatus).json({ message });
    }
  };
}

function requireBodyField(body, field, message) {
  const value = body?.[field];
  if (!value) {
    throw new HttpError(400, message || `${field} is required`);
  }
  return value;
}

module.exports = {
  HttpError,
  wrapRoute,
  requireBodyField,
  findCharger,
  findLocation,
};
