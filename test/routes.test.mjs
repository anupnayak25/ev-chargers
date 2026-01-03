import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { registerLocationTests } from "./suites/locations.mjs";
import { registerChargerTests } from "./suites/chargers.mjs";
import { registerConnectorTests } from "./suites/connectors.mjs";

const require = createRequire(import.meta.url);

/** @type {import('mongodb-memory-server').MongoMemoryServer} */
let mongo;

// Import CJS modules from ESM test file
const { app } = require("../server.js");
const Location = require("../src/model/Location");

//Baseline data seeding functions to mimic real-world usage
async function seedLocation({ locationId = "LOC-001" } = {}) {
  return Location.create({
    locationId,
    name: "Sample Location",
    address: "123 Main St",
    chargers: [],
  });
}
async function seedCharger({ locationId = "LOC-001", chargerId = "CHG-001" } = {}) {
  await seedLocation({ locationId });
  const res = await request(app)
    .post(`/locations/${encodeURIComponent(locationId)}/chargers`)
    .send({ chargerId, type: "DC", connectors: [] });
  assert.equal(res.status, 201);
}
async function seedConnector({ locationId = "LOC-001", chargerId = "CHG-001", connectorId = "CON-001" } = {}) {
  await seedCharger({ locationId, chargerId });
  const res = await request(app)
    .post(`/locations/${encodeURIComponent(locationId)}/chargers/${encodeURIComponent(chargerId)}/connectors`)
    .send({ connectorId, status: "AVAILABLE" });
  assert.equal(res.status, 201);
}

//mongo-memory-server setup and teardown for testing
before(
  async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  },
  { timeout: 60_000 }
);
beforeEach(async () => {
  await Location.deleteMany({});
});
after(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

//Sanity check for server health endpoint
describe("Checking Health", () => {
  it("responds with status 200 on GET / to indicate the server is healthy", async () => {
    const res = await request(app).get("/");
    assert.equal(res.status, 200);
    assert.match(res.text, /server is running/i);
  });
});

// Register suites (each suite defines its own describe/it blocks)
registerLocationTests({ request, app, assert, seedLocation });
registerChargerTests({ request, app, assert, seedLocation, seedCharger });
registerConnectorTests({ request, app, assert, seedLocation, seedCharger, seedConnector });
