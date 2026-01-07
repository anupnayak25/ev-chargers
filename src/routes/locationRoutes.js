const { Router } = require("express");
const router = Router();
const Location = require("../model/Location");
const { HttpError, wrapRoute, requireBodyField, findLocation } = require("./routeUtils");

async function ensureLocationDoesNotExist(locationId) {
  const existing = await Location.findOne({ locationId });
  if (existing) {
    throw new HttpError(409, "Location already exists");
  }
}

async function createLocation(req, res) {
  requireBodyField(req.body, "locationId", "locationId is required");

  await ensureLocationDoesNotExist(req.body.locationId);
  const savedLocation = await Location.create(req.body);
  res.status(201).json(savedLocation);
}
async function listLocations(req, res) {
  const locations = await Location.find();
  res.json(locations);
}

async function deleteLocation(req, res) {
  const deletedLocation = await Location.findOneAndDelete({ locationId: req.params.id });
  if (!deletedLocation) {
    throw new HttpError(404, "Location not found");
  }
  res.status(200).json({ message: "Location deleted successfully" });
}

async function getLocation(req, res) {
  const location = await findLocation(req.params.id);
  res.json(location);
}

router.post(
  "/",
  wrapRoute(createLocation, {
    defaultStatus: 400,
    exposeErrorMessage: true,
    duplicateKeyMessage: "Location already exists",
  })
);
router.get("/", wrapRoute(listLocations, { exposeErrorMessage: true }));
router.delete("/:id", wrapRoute(deleteLocation, { exposeErrorMessage: true }));
router.get("/:id", wrapRoute(getLocation, { exposeErrorMessage: true }));
module.exports = router;
