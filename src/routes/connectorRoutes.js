const express = require("express");
const router = express.Router();
const Location = require("../model/Location");
const { HttpError, wrapRoute, requireBodyField , findCharger, findLocation } = require("./routeUtils");

function removeConnector(charger, connectorId) {
  const connectorIndex = charger.connectors.findIndex((c) => c.connectorId === connectorId);
  if (connectorIndex === -1) {
    throw new HttpError(404, "Connector not found");
  }
  charger.connectors.splice(connectorIndex, 1); 
}

async function postConnector(req, res) {
  const { locationId, chargerId } = req.params;
  requireBodyField(req.body, "connectorId", "connectorId is required");

  const updatedLocation = await Location.findOneAndUpdate(
    {
      locationId,
      chargers: {
        $elemMatch: { chargerId, "connectors.connectorId": { $ne: req.body.connectorId } },
      },
    },
    { $push: { "chargers.$.connectors": req.body } },
    { new: true }
  );
  if (updatedLocation) {
    res.status(201).json(updatedLocation);
    return;
  }

  const location = await findLocation(locationId);
  findCharger(location, chargerId);
  throw new HttpError(409, "Connector already exists");
}

async function listConnectors(req, res) {
  const location = await findLocation(req.params.locationId);
  const charger = findCharger(location, req.params.chargerId);
  res.status(200).json(charger.connectors);
}

async function deleteConnector(req, res) {
  const location = await findLocation(req.params.locationId);
  const charger = findCharger(location, req.params.chargerId);
  removeConnector(charger, req.params.connectorId);
  await location.save();
  res.status(200).json({ message: "Connector deleted successfully" });
}

router.post("/:locationId/chargers/:chargerId/connectors", wrapRoute(postConnector));
router.get("/:locationId/chargers/:chargerId/connectors", wrapRoute(listConnectors, { exposeErrorMessage: true }));
router.delete("/:locationId/chargers/:chargerId/connectors/:connectorId",wrapRoute(deleteConnector, { exposeErrorMessage: true }));
module.exports = router;
