import { describe, it } from "node:test";

export function registerConnectorTests({ request, app, assert, seedLocation, seedCharger, seedConnector }) {
  describe("Connectors routes", () => {
    it("Adds a connector on POST /locations/:locationId/chargers/:chargerId/connectors with a valid payload", async () => {
      await seedCharger({ locationId: "LOC-001", chargerId: "CHG-001" });
      const res = await request(app)
        .post("/locations/LOC-001/chargers/CHG-001/connectors")
        .send({ connectorId: "CON-001", status: "AVAILABLE" });

      assert.equal(res.status, 201);
      const charger = res.body.chargers.find((c) => c.chargerId === "CHG-001");
      assert.ok(charger);
      assert.equal(charger.connectors[0].connectorId, "CON-001");

      // Customer expectation: the created connector should be retrievable afterward
      const list = await request(app).get("/locations/LOC-001/chargers/CHG-001/connectors");
      assert.equal(list.status, 200);
      assert.ok(Array.isArray(list.body));
      assert.ok(list.body.some((c) => c.connectorId === "CON-001"));
    });

    it("Rejects connector creation when connectorId is missing (400)", async () => {
      await seedCharger({ locationId: "LOC-001", chargerId: "CHG-001" });
      const res = await request(app)
        .post("/locations/LOC-001/chargers/CHG-001/connectors")
        .send({ status: "AVAILABLE" });
      assert.equal(res.status, 400);
    });

    it("Rejects duplicate connectors when the same connectorId is submitted for the same charger (409)", async () => {
      await seedConnector({ locationId: "LOC-001", chargerId: "CHG-001", connectorId: "CON-001" });
      const res = await request(app)
        .post("/locations/LOC-001/chargers/CHG-001/connectors")
        .send({ connectorId: "CON-001", status: "AVAILABLE" });
      assert.equal(res.status, 409);
    });

    it("Lists connectors for a charger on GET /locations/:locationId/chargers/:chargerId/connectors", async () => {
      await seedConnector({ locationId: "LOC-001", chargerId: "CHG-001", connectorId: "CON-001" });
      const res = await request(app).get("/locations/LOC-001/chargers/CHG-001/connectors");
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.equal(res.body.length, 1);
    });

    it("Deletes a connector on DELETE /locations/:locationId/chargers/:chargerId/connectors/:connectorId for an existing connector", async () => {
      await seedConnector({ locationId: "LOC-001", chargerId: "CHG-001", connectorId: "CON-001" });
      const del = await request(app).delete("/locations/LOC-001/chargers/CHG-001/connectors/CON-001");
      assert.equal(del.status, 200);

      const list = await request(app).get("/locations/LOC-001/chargers/CHG-001/connectors");
      assert.equal(list.status, 200);
      assert.ok(Array.isArray(list.body));
      assert.equal(list.body.length, 0);
    });

    it("Returns 404 when adding a connector to a charger that does not exist", async () => {
      await seedLocation({ locationId: "LOC-001" });
      const res = await request(app)
        .post("/locations/LOC-001/chargers/CHG-404/connectors")
        .send({ connectorId: "CON-001", status: "AVAILABLE" });
      assert.equal(res.status, 404);
    });
  });
}
