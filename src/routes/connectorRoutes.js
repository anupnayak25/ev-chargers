const express = require('express');
const router = express.Router();
const Location = require('../model/Location');

router.post('/:locationId/:chargerId/add', async (req, res) => {
    const { locationId, chargerId } = req.params;
    try {
        const location = await Location.findOne({ locationId });
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }
        const charger = location.chargers.find(charger => charger.chargerId === chargerId);
        if (!charger) {
            return res.status(404).json({ message: 'Charger not found' });
        }
        charger.connectors.push(req.body);
        const updatedLocation = await location.save();
        res.status(201).json(updatedLocation);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }   
});
router.get('/:locationId/:chargerId', async (req, res) => {
    const { locationId, chargerId } = req.params;
    try {
        const location = await Location.findOne({ locationId });
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }
        const charger = location.chargers.find(charger => charger.chargerId === chargerId);
        if (!charger) {
            return res.status(404).json({ message: 'Charger not found' });
        }
        res.status(200).json(charger.connectors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
});
router.delete('/:locationId/:chargerId/:connectorId', async (req, res) => { 
    const { locationId, chargerId, connectorId } = req.params;
    try {
        const location = await Location.findOne({ locationId });
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }
        const charger = location.chargers.find(charger => charger.chargerId === chargerId);
        if (!charger) {
            return res.status(404).json({ message: 'Charger not found' });
        }
        const connectorIndex = charger.connectors.findIndex(connector => connector.connectorId === connectorId);
        if (connectorIndex === -1) {
            return res.status(404).json({ message: 'Connector not found' });
        }
        charger.connectors.splice(connectorIndex, 1);
        const updatedLocation = await location.save();
        res.status(200).json({ message: 'Connector deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
module.exports = router;