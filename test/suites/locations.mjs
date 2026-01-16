import { describe, it } from "node:test";
import { expectArrayLength, expectStatus } from "../helpers/assertHelpers.mjs";
import { postLocation } from "../helpers/api.mjs";

export function registerLocationTests({ request, app, assert, seedLocation }) {
  describe("Locations routes", () => {
    it("Creates a location on POST /locations with a valid payload", async () => {
      const res = await expectStatus(
        postLocation(request, app, {
          locationId: "LOC-001",
          name: "Sample Location",
          address: "123 Main St",
          chargers: [],
        }),
        assert,
        201
      );
      assert.equal(res.body.locationId, "LOC-001");

      // Customer expectation: the created location should be retrievable afterward
      const get = await expectStatus(request(app).get("/locations/LOC-001"), assert, 200);
      assert.equal(get.body.locationId, "LOC-001");
      assert.equal(get.body.name, "Sample Location");
    });

    it("Rejects location creation when locationId is missing (400)", async () => {
      await expectStatus(postLocation(request, app, { name: "No ID" }), assert, 400);
    });

    it("Rejects if duplicate locationId is submitted (409)", async () => {
      await seedLocation({ locationId: "LOC-001" });
      await expectStatus(
        postLocation(request, app, { locationId: "LOC-001", name: "Duplicate", address: "Somewhere", chargers: [] }),
        assert,
        409
      );
    });

    it("Lists all locations on GET /locations (200)", async () => {
      await seedLocation({ locationId: "LOC-001" });
      const res = await expectStatus(request(app).get("/locations"), assert, 200);
      expectArrayLength(res.body, assert, 1);
    });

    it("Fetches a location by locationId on GET /locations/:id for an existing location", async () => {
      await seedLocation({ locationId: "LOC-001" });
      const res = await expectStatus(request(app).get("/locations/LOC-001"), assert, 200);
      assert.equal(res.body.locationId, "LOC-001");
    });

    it("Deletes a location on DELETE /locations/:id for an existing location", async () => {
      await seedLocation({ locationId: "LOC-001" });
      await expectStatus(request(app).delete("/locations/LOC-001"), assert, 200);
      await expectStatus(request(app).get("/locations/LOC-001"), assert, 404);
    });

    it("Returns 404 when deleting a location that does not exist", async () => {
      await expectStatus(request(app).delete("/locations/LOC-404"), assert, 404);
    });
  });
}
