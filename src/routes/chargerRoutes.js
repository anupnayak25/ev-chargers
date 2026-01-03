const express = require("express");
const router = express.Router();
const Location = require("../model/Location");

router.post("/:locationId/chargers", async (req, res) => {
  const { locationId } = req.params;
  try {
    const { chargerId } = req.body;
    if (!chargerId) {
      return res.status(400).json({ message: "chargerId is required" });
    }
    
    const updatedLocation = await Location.findOneAndUpdate(
      { locationId, "chargers.chargerId": { $ne: chargerId } },
      { $push: { chargers: req.body } },
      { new: true }
    );   // Only updates if a charger with the same chargerId does NOT already exist.

    if (updatedLocation) {
      return res.status(201).json(updatedLocation);
    }

    // No update occurred: either the location doesn't exist OR the chargerId already exists.
    const locationExists = await Location.exists({ locationId });
    if (!locationExists) {
      return res.status(404).json({ message: "Location not found" });
    }
    return res.status(409).json({ message: "Charger already exists" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:locationId/chargers", async (req, res) => {
  try {
    const location = await Location.findOne({ locationId: req.params.locationId });
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    res.status(200).json(location.chargers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:locationId/chargers/:chargerId", async (req, res) => {
  const { locationId, chargerId } = req.params;
  try {
    const location = await Location.findOne({ locationId });
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    const charger = location.chargers.find((charger) => charger.chargerId === chargerId);
    if (!charger) {
      return res.status(404).json({ message: "Charger not found" });
    }
    res.status(200).json(charger);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:locationId/chargers/:chargerId", async (req, res) => {
  const { locationId, chargerId } = req.params;
  try {
    const location = await Location.findOne({ locationId });
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    const chargerIndex = location.chargers.findIndex((charger) => charger.chargerId === chargerId);
    if (chargerIndex === -1) {
      return res.status(404).json({ message: "Charger not found" });
    }
    location.chargers.splice(chargerIndex, 1);
    await location.save();
    res.status(200).json({ message: "Charger deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
