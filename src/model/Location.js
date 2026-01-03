const mongoose = require("mongoose");

const ConnectorSchema = new mongoose.Schema({
  connectorId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  status: String,
});

const ChargerSchema = new mongoose.Schema({
  chargerId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  type: String,
  connectors: [ConnectorSchema],
});

const LocationSchema = new mongoose.Schema({
  locationId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  name:  String,
  address: String,  
  chargers: [ChargerSchema],
});
module.exports = mongoose.model("Location", LocationSchema);
