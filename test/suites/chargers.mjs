import { describe, it } from "node:test";

export function registerChargerTests({ request, app, assert, seedLocation, seedCharger }) {
  describe("Chargers routes", () => {
    it("POST /locations/:locationId/chargers adds a charger", async () => {
      await seedLocation({ locationId: "LOC-001" });
      const res = await request(app)
        .post("/locations/LOC-001/chargers")
        .send({ chargerId: "CHG-001", type: "DC", connectors: [] });

      assert.equal(res.status, 201);
      assert.ok(Array.isArray(res.body.chargers));
      assert.equal(res.body.chargers[0].chargerId, "CHG-001");
    });

    it("POST /locations/:locationId/chargers rejects missing chargerId", async () => {
      await seedLocation({ locationId: "LOC-001" });
      const res = await request(app).post("/locations/LOC-001/chargers").send({ type: "DC" });
      assert.equal(res.status, 400);
    });

    it("POST /locations/:locationId/chargers rejects duplicate chargerId (409)", async () => {
      await seedCharger({ locationId: "LOC-001", chargerId: "CHG-001" });
      const res = await request(app)
        .post("/locations/LOC-001/chargers")
        .send({ chargerId: "CHG-001", type: "DC", connectors: [] });
      assert.equal(res.status, 409);
    });

    it("GET /locations/:locationId/chargers lists chargers", async () => {
      await seedCharger({ locationId: "LOC-001", chargerId: "CHG-001" });
      const res = await request(app).get("/locations/LOC-001/chargers");
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.equal(res.body.length, 1);
    });

    it("GET /locations/:locationId/chargers/:chargerId fetches a charger", async () => {
      await seedCharger({ locationId: "LOC-001", chargerId: "CHG-001" });
      const res = await request(app).get("/locations/LOC-001/chargers/CHG-001");
      assert.equal(res.status, 200);
      assert.equal(res.body.chargerId, "CHG-001");
    });

    it("DELETE /locations/:locationId/chargers/:chargerId deletes a charger", async () => {
      await seedCharger({ locationId: "LOC-001", chargerId: "CHG-001" });

      const del = await request(app).delete("/locations/LOC-001/chargers/CHG-001");
      assert.equal(del.status, 200);

      const get = await request(app).get("/locations/LOC-001/chargers/CHG-001");
      assert.equal(get.status, 404);
    });

    it("POST /locations/:locationId/chargers returns 404 if location missing", async () => {
      const res = await request(app)
        .post("/locations/LOC-404/chargers")
        .send({ chargerId: "CHG-001", type: "DC", connectors: [] });
      assert.equal(res.status, 404);
    });
  });
}
