const router = require("express").Router();
const {
  HttpError,
  wrapRoute,
  requireBodyField,
  loadLocationAndCharger,
  tryAddUniqueConnector,
} = require("./routeUtils");

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

  const updatedLocation = await tryAddUniqueConnector(locationId, chargerId, req.body);
  if (updatedLocation) {
    res.status(201).json(updatedLocation);
    return;
  }

  await loadLocationAndCharger(locationId, chargerId);
  throw new HttpError(409, "Connector already exists");
}

async function listConnectors(req, res) {
  const { charger } = await loadLocationAndCharger(req.params.locationId, req.params.chargerId);
  res.json(charger.connectors);
}

async function deleteConnector(req, res) {
  const { location, charger } = await loadLocationAndCharger(req.params.locationId, req.params.chargerId);
  removeConnector(charger, req.params.connectorId);
  await location.save();
  res.json({ message: "Connector deleted successfully" });
}

router.post("/:locationId/chargers/:chargerId/connectors", wrapRoute(postConnector));
router.get("/:locationId/chargers/:chargerId/connectors", wrapRoute(listConnectors, { exposeErrorMessage: true }));
router.delete(
  "/:locationId/chargers/:chargerId/connectors/:connectorId",
  wrapRoute(deleteConnector, { exposeErrorMessage: true })
);
module.exports = router;
