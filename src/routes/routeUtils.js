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

function tryRespondHttpError(res, error) {
  if (!(error instanceof HttpError)) {
    return false;
  }
  res.status(error.status).json({ message: error.message });
  return true;
}

function tryRespondDuplicateKeyError(res, error, options) {
  if (!isMongoDuplicateKeyError(error)) {
    return false;
  }
  res.status(options.duplicateKeyStatus).json({ message: options.duplicateKeyMessage });
  return true;
}

function resolveFallbackMessage(error, options) {
  const exposedMessage = (error && error.message) || options.defaultMessage;
  return [options.defaultMessage, exposedMessage][Number(Boolean(options.exposeErrorMessage))];
}

function handleRouteError(res, error, options) {
  if (tryRespondHttpError(res, error)) return;
  if (tryRespondDuplicateKeyError(res, error, options)) return;

  const message = resolveFallbackMessage(error, options);
  res.status(options.defaultStatus).json({ message });
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

async function loadLocationAndCharger(locationId, chargerId) {
  const location = await findLocation(locationId);
  const charger = findCharger(location, chargerId);
  return { location, charger };
}

async function addCharger(locationId, charger) {
  return Location.findOneAndUpdate(
    { locationId, "chargers.chargerId": { $ne: charger.chargerId } },
    { $push: { chargers: charger } },
    { new: true }
  );
}

async function addConnector(locationId, chargerId, connector) {
  return Location.findOneAndUpdate(
    {
      locationId,
      chargers: {
        $elemMatch: {
          chargerId,
          "connectors.connectorId": { $ne: connector.connectorId },
        },
      },
    },
    { $push: { "chargers.$.connectors": connector } },
    { new: true }
  );
}

function wrapRoute(handler, options = {}) {
  const {
    defaultStatus = 500,
    defaultMessage = "Server error",
    exposeErrorMessage = false,
    duplicateKeyStatus = 409,
    duplicateKeyMessage = "Already exists",
  } = options;

  const resolvedOptions = {
    defaultStatus,
    defaultMessage,
    exposeErrorMessage,
    duplicateKeyStatus,
    duplicateKeyMessage,
  };

  return async function routeHandler(req, res) {
    try {
      await handler(req, res);
    } catch (error) {
      handleRouteError(res, error, resolvedOptions);
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
  loadLocationAndCharger,
  addCharger,
  addConnector,
};
