const express = require("express");
const router = express.Router();
const Location = require("../model/Location");
const { HttpError, wrapRoute, requireBodyField, findCharger, findLocation} = require("./routeUtils");

async function ensureLocationExists(locationId) {
  const exists = await Location.exists({ locationId });
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

  const updatedLocation = await Location.findOneAndUpdate(
    { locationId, "chargers.chargerId": { $ne: req.body.chargerId } },
    { $push: { chargers: req.body } },
    { new: true }
  );

  if (updatedLocation) {
    res.status(201).json(updatedLocation);
    return;
  }

  await ensureLocationExists(locationId);
  throw new HttpError(409, "Charger already exists");
}

async function listChargers(req, res) {
  const location = await findLocation(req.params.locationId);
  res.status(200).json(location.chargers);
}

async function getCharger(req, res) {
  const location = await findLocation(req.params.locationId);
  const charger = findCharger(location, req.params.chargerId);
  res.status(200).json(charger);
}

async function deleteCharger(req, res) {
  const location = await findLocation(req.params.locationId);
  removeCharger(location, req.params.chargerId);
  await location.save();
  res.status(200).json({ message: "Charger deleted successfully" });
}

router.post("/:locationId/chargers", wrapRoute(postCharger));
router.get("/:locationId/chargers", wrapRoute(listChargers, { exposeErrorMessage: true }));
router.get("/:locationId/chargers/:chargerId", wrapRoute(getCharger, { exposeErrorMessage: true }));
router.delete("/:locationId/chargers/:chargerId", wrapRoute(deleteCharger, { exposeErrorMessage: true }));

module.exports = router;
