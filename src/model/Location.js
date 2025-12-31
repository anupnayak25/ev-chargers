const mongoose = require("mongoose");

const ConnectorSchema = new mongoose.Schema({
  connectorId: String,
  status: String,
});

const ChargerSchema = new mongoose.Schema({
    chargerId: String,
    type: String,
    connectors: [ConnectorSchema],
});

const LocationSchema = new mongoose.Schema({
    locationId: String,
    name: String,
    address: String,
    chargers: [ChargerSchema],
});
module.exports = mongoose.model("Location", LocationSchema);