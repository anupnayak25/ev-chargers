const express = require("express");
const LocationModel = require("../model/Location");
const router = express.Router();
const {
  HttpError,
  wrapRoute,
  requireBodyField,
  findCharger,
  findLocation,
  addCharger,
} = require("./routeUtils");

async function ensureLocationExists(locationId) {
  const exists = await LocationModel.exists({ locationId });
  if (!exists) {
    throw new HttpError(404, "Location not found");
  }
}

function removeCharger(location, chargerId) {
  const chargerIndex = location.chargers.findIndex((c) => c.chargerId === chargerId);
  if (chargerIndex === -1) {
    throw new HttpError(404, "Charger not found");
  }
  location.chargers.splice(chargerIndex, 1);
}

async function postCharger(req, res) {
  const { locationId } = req.params;
  requireBodyField(req.body, "chargerId", "chargerId is required");

  const updatedLocation = await addCharger(locationId, req.body);

  if (!updatedLocation) {
    await ensureLocationExists(locationId);
    throw new HttpError(409, "Charger already exists");
  }

  res.status(201).json(updatedLocation);
}

async function listChargers(req, res) {
  const location = await findLocation(req.params.locationId);
  res.json(location.chargers);
}

async function getCharger(req, res) {
  const location = await findLocation(req.params.locationId);
  const charger = findCharger(location, req.params.chargerId);
  res.json(charger);
}

async function deleteCharger(req, res) {
  const location = await findLocation(req.params.locationId);
  removeCharger(location, req.params.chargerId);
  await location.save();
  res.json({ message: "Charger deleted successfully" });
}

router.post("/:locationId/chargers", wrapRoute(postCharger));
router.get("/:locationId/chargers", wrapRoute(listChargers, { exposeErrorMessage: true }));
router.get("/:locationId/chargers/:chargerId", wrapRoute(getCharger, { exposeErrorMessage: true }));
router.delete("/:locationId/chargers/:chargerId", wrapRoute(deleteCharger, { exposeErrorMessage: true }));

module.exports = router;
