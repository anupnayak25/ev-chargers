import { describe, it } from "node:test";
import { expectArray, expectArrayLength, expectSome, expectStatus } from "../helpers/assertHelpers.mjs";
import { postConnector } from "../helpers/api.mjs";

export function registerConnectorTests({ request, app, assert, seedLocation, seedCharger, seedConnector }) {
  const defaultLocationId = "LOC-001";
  const defaultChargerId = "CHG-001";
  const defaultConnectorPayload = { connectorId: "CON-001", status: "AVAILABLE" };

  async function createConnector(
    locationId = defaultLocationId,
    chargerId = defaultChargerId,
    payload = defaultConnectorPayload,
    expectedStatus = 201
  ) {
    return expectStatus(postConnector(request, app, locationId, chargerId, payload), assert, expectedStatus);
  }

  describe("Connectors routes", () => {
    it("Adds a connector on POST /locations/:locationId/chargers/:chargerId/connectors with a valid payload", async () => {
      await seedCharger({ locationId: defaultLocationId, chargerId: defaultChargerId });
      const res = await createConnector();
      const charger = res.body.chargers.find((c) => c.chargerId === "CHG-001");
      assert.ok(charger);
      assert.equal(charger.connectors[0].connectorId, "CON-001");

      // Customer expectation: the created connector should be retrievable afterward
      const list = await expectStatus(request(app).get("/locations/LOC-001/chargers/CHG-001/connectors"), assert, 200);
      expectSome(list.body, assert, (c) => c.connectorId === "CON-001");
    });

    it("Rejects connector creation when connectorId is missing (400)", async () => {
      await seedCharger({ locationId: defaultLocationId, chargerId: defaultChargerId });
      await createConnector(defaultLocationId, defaultChargerId, { status: "AVAILABLE" }, 400);
    });

    it("Rejects duplicate connectors when the same connectorId is submitted for the same charger (409)", async () => {
      await seedConnector({ locationId: defaultLocationId, chargerId: defaultChargerId, connectorId: "CON-001" });
      await createConnector(defaultLocationId, defaultChargerId, defaultConnectorPayload, 409);
    });

    it("Lists connectors for a charger on GET /locations/:locationId/chargers/:chargerId/connectors", async () => {
      await seedConnector({ locationId: "LOC-001", chargerId: "CHG-001", connectorId: "CON-001" });
      const res = await expectStatus(request(app).get("/locations/LOC-001/chargers/CHG-001/connectors"), assert, 200);
      expectArrayLength(res.body, assert, 1);
    });

    it("Deletes a connector on DELETE /locations/:locationId/chargers/:chargerId/connectors/:connectorId for an existing connector", async () => {
      await seedConnector({ locationId: "LOC-001", chargerId: "CHG-001", connectorId: "CON-001" });
      await expectStatus(request(app).delete("/locations/LOC-001/chargers/CHG-001/connectors/CON-001"), assert, 200);
      const list = await expectStatus(request(app).get("/locations/LOC-001/chargers/CHG-001/connectors"), assert, 200);
      expectArray(list.body, assert);
      assert.equal(list.body.length, 0);
    });

    it("Returns 404 when deleting a connector that does not exist", async () => {
      await seedCharger({ locationId: defaultLocationId, chargerId: defaultChargerId });
      await expectStatus(
        request(app).delete(`/locations/${defaultLocationId}/chargers/${defaultChargerId}/connectors/CON-404`),
        assert,
        404
      );
    });

    it("Returns 404 when adding a connector to a charger that does not exist", async () => {
      await seedLocation({ locationId: "LOC-001" });
      await expectStatus(
        postConnector(request, app, "LOC-001", "CHG-404", { connectorId: "CON-001", status: "AVAILABLE" }),
        assert,
        404
      );
    });
  });
}
