import { describe, it } from "node:test";
import { expectArrayLength, expectStatus } from "../helpers/assertHelpers.mjs";
import { postCharger } from "../helpers/api.mjs";

export function registerChargerTests({ request, app, assert, seedLocation, seedCharger }) {
  const defaultLocationId = "LOC-001";
  const defaultChargerPayload = { chargerId: "CHG-001", type: "DC", connectors: [] };

  async function createCharger(locationId = defaultLocationId, payload = defaultChargerPayload, expectedStatus = 201) {
    return expectStatus(postCharger(request, app, locationId, payload), assert, expectedStatus);
  }

  describe("Chargers routes", () => {
    it("Adds a charger on POST /locations/:locationId/chargers with a valid payload", async () => {
      await seedLocation({ locationId: defaultLocationId });
      const res = await createCharger();
      expectArrayLength(res.body.chargers, assert, 1);
      assert.equal(res.body.chargers[0].chargerId, "CHG-001");

      // Customer expectation: the created charger should be retrievable afterward
      const get = await expectStatus(request(app).get("/locations/LOC-001/chargers/CHG-001"), assert, 200);
      assert.equal(get.body.chargerId, "CHG-001");
      assert.equal(get.body.type, "DC");
    });

    it("Rejects charger creation when chargerId is missing (400)", async () => {
      await seedLocation({ locationId: defaultLocationId });
      await createCharger(defaultLocationId, { type: "DC" }, 400);
    });

    it("Rejects duplicate chargers when the same chargerId is submitted for the same location (409)", async () => {
      await seedCharger({ locationId: defaultLocationId, chargerId: "CHG-001" });
      await createCharger(defaultLocationId, defaultChargerPayload, 409);
    });

    it("Lists chargers for a location on GET /locations/:locationId/chargers", async () => {
      await seedCharger({ locationId: defaultLocationId, chargerId: "CHG-001" });
      const res = await expectStatus(request(app).get(`/locations/${defaultLocationId}/chargers`), assert, 200);
      expectArrayLength(res.body, assert, 1);
    });

    it("Fetches a charger by chargerId on GET /locations/:locationId/chargers/:chargerId for an existing charger", async () => {
      await seedCharger({ locationId: defaultLocationId, chargerId: "CHG-001" });
      const res = await expectStatus(request(app).get(`/locations/${defaultLocationId}/chargers/CHG-001`), assert, 200);
      assert.equal(res.body.chargerId, "CHG-001");
    });

    it("Deletes a charger on DELETE /locations/:locationId/chargers/:chargerId for an existing charger", async () => {
      await seedCharger({ locationId: defaultLocationId, chargerId: "CHG-001" });
      await expectStatus(request(app).delete(`/locations/${defaultLocationId}/chargers/CHG-001`), assert, 200);
      await expectStatus(request(app).get(`/locations/${defaultLocationId}/chargers/CHG-001`), assert, 404);
    });

    it("Returns 404 when deleting a charger that does not exist", async () => {
      await seedLocation({ locationId: defaultLocationId });
      await expectStatus(request(app).delete(`/locations/${defaultLocationId}/chargers/CHG-404`), assert, 404);
    });

    it("Returns 404 when adding a charger to a location that does not exist", async () => {
      await expectStatus(
        postCharger(request, app, "LOC-404", { chargerId: "CHG-001", type: "DC", connectors: [] }),
        assert,
        404
      );
    });
  });
}
