import { describe, it } from "node:test";

export function registerConnectorTests({ request, app, assert, seedLocation, seedCharger, seedConnector }) {
  describe("Connectors routes", () => {
    it("POST /locations/:locationId/chargers/:chargerId/connectors adds a connector", async () => {
      await seedCharger({ locationId: "LOC-001", chargerId: "CHG-001" });
      const res = await request(app)
        .post("/locations/LOC-001/chargers/CHG-001/connectors")
        .send({ connectorId: "CON-001", status: "AVAILABLE" });

      assert.equal(res.status, 201);
      const charger = res.body.chargers.find((c) => c.chargerId === "CHG-001");
      assert.ok(charger);
      assert.equal(charger.connectors[0].connectorId, "CON-001");
    });

    it("POST /.../connectors rejects missing connectorId", async () => {
      await seedCharger({ locationId: "LOC-001", chargerId: "CHG-001" });
      const res = await request(app)
        .post("/locations/LOC-001/chargers/CHG-001/connectors")
        .send({ status: "AVAILABLE" });
      assert.equal(res.status, 400);
    });

    it("POST /.../connectors rejects duplicate connectorId (409)", async () => {
      await seedConnector({ locationId: "LOC-001", chargerId: "CHG-001", connectorId: "CON-001" });
      const res = await request(app)
        .post("/locations/LOC-001/chargers/CHG-001/connectors")
        .send({ connectorId: "CON-001", status: "AVAILABLE" });
      assert.equal(res.status, 409);
    });

    it("GET /.../connectors lists connectors", async () => {
      await seedConnector({ locationId: "LOC-001", chargerId: "CHG-001", connectorId: "CON-001" });
      const res = await request(app).get("/locations/LOC-001/chargers/CHG-001/connectors");
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.equal(res.body.length, 1);
    });

    it("DELETE /.../connectors/:connectorId deletes a connector", async () => {
      await seedConnector({ locationId: "LOC-001", chargerId: "CHG-001", connectorId: "CON-001" });
      const del = await request(app).delete("/locations/LOC-001/chargers/CHG-001/connectors/CON-001");
      assert.equal(del.status, 200);

      const list = await request(app).get("/locations/LOC-001/chargers/CHG-001/connectors");
      assert.equal(list.status, 200);
      assert.ok(Array.isArray(list.body));
      assert.equal(list.body.length, 0);
    });

    it("POST /.../connectors returns 404 if charger missing", async () => {
      await seedLocation({ locationId: "LOC-001" });
      const res = await request(app)
        .post("/locations/LOC-001/chargers/CHG-404/connectors")
        .send({ connectorId: "CON-001", status: "AVAILABLE" });
      assert.equal(res.status, 404);
    });
  });
}
