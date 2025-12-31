const express = require("express");
const router = express.Router();
const Location = require("../model/Location");

router.post("/:locationId/add", async (req, res) => {
    const { locationId } = req.params;
    try {
        const location = await Location.findOne({ locationId });
        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }
        location.chargers.push(req.body);
        const updatedLocation = await location.save();
        res.status(201).json(updatedLocation);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/:locationId", async (req, res) => {
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

router.get("/:locationId/:chargerId", async (req, res) => {
    const { locationId, chargerId } = req.params;
    try {
        const location = await Location.findOne({ locationId });
        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }  
        const charger = location.chargers.find(charger => charger.chargerId === chargerId);
        if (!charger) {
            return res.status(404).json({ message: "Charger not found" });
        }
        res.status(200).json(charger);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:locationId/:chargerId", async (req, res) => {
    const { locationId, chargerId } = req.params;
    try {
        const location = await Location.findOne({ locationId });
        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }   
        const chargerIndex = location.chargers.findIndex(charger => charger.chargerId === chargerId);
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