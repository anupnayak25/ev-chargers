import { describe, it } from "node:test";

export function registerChargerTests({ request, app, assert, seedLocation, seedCharger }) {
  describe("Chargers routes", () => {
    it("Adds a charger on POST /locations/:locationId/chargers with a valid payload", async () => {
      await seedLocation({ locationId: "LOC-001" });
      const res = await request(app)
        .post("/locations/LOC-001/chargers")
        .send({ chargerId: "CHG-001", type: "DC", connectors: [] });

      assert.equal(res.status, 201);
      assert.ok(Array.isArray(res.body.chargers));
      assert.equal(res.body.chargers[0].chargerId, "CHG-001");

      // Customer expectation: the created charger should be retrievable afterward
      const get = await request(app).get("/locations/LOC-001/chargers/CHG-001");
      assert.equal(get.status, 200);
      assert.equal(get.body.chargerId, "CHG-001");
      assert.equal(get.body.type, "DC");
    });

    it("Rejects charger creation when chargerId is missing (400)", async () => {
      await seedLocation({ locationId: "LOC-001" });
      const res = await request(app).post("/locations/LOC-001/chargers").send({ type: "DC" });
      assert.equal(res.status, 400);
    });

    it("Rejects duplicate chargers when the same chargerId is submitted for the same location (409)", async () => {
      await seedCharger({ locationId: "LOC-001", chargerId: "CHG-001" });
      const res = await request(app)
        .post("/locations/LOC-001/chargers")
        .send({ chargerId: "CHG-001", type: "DC", connectors: [] });
      assert.equal(res.status, 409);
    });

    it("Lists chargers for a location on GET /locations/:locationId/chargers", async () => {
      await seedCharger({ locationId: "LOC-001", chargerId: "CHG-001" });
      const res = await request(app).get("/locations/LOC-001/chargers");
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.equal(res.body.length, 1);
    });

    it("Fetches a charger by chargerId on GET /locations/:locationId/chargers/:chargerId for an existing charger", async () => {
      await seedCharger({ locationId: "LOC-001", chargerId: "CHG-001" });
      const res = await request(app).get("/locations/LOC-001/chargers/CHG-001");
      assert.equal(res.status, 200);
      assert.equal(res.body.chargerId, "CHG-001");
    });

    it("Deletes a charger on DELETE /locations/:locationId/chargers/:chargerId for an existing charger", async () => {
      await seedCharger({ locationId: "LOC-001", chargerId: "CHG-001" });

      const del = await request(app).delete("/locations/LOC-001/chargers/CHG-001");
      assert.equal(del.status, 200);

      const get = await request(app).get("/locations/LOC-001/chargers/CHG-001");
      assert.equal(get.status, 404);
    });

    it("Returns 404 when adding a charger to a location that does not exist", async () => {
      const res = await request(app)
        .post("/locations/LOC-404/chargers")
        .send({ chargerId: "CHG-001", type: "DC", connectors: [] });
      assert.equal(res.status, 404);
    });
  });
}
