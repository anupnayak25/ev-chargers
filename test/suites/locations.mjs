import { describe, it } from "node:test";

export function registerLocationTests({ request, app, assert, seedLocation }) {
  describe("Locations routes", () => {
    it("Creates a location on POST /locations with a valid payload", async () => {
      const res = await request(app).post("/locations").send({
        locationId: "LOC-001",
        name: "Sample Location",
        address: "123 Main St",
        chargers: [],
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.locationId, "LOC-001");

      // Customer expectation: the created location should be retrievable afterward
      const get = await request(app).get("/locations/LOC-001");
      assert.equal(get.status, 200);
      assert.equal(get.body.locationId, "LOC-001");
      assert.equal(get.body.name, "Sample Location");
    });

    it("Rejects location creation when locationId is missing (400)", async () => {
      const res = await request(app).post("/locations").send({ name: "No ID" });
      assert.equal(res.status, 400);
    });

    it("Rejects if duplicate locationId is submitted (409)", async () => {
      await seedLocation({ locationId: "LOC-001" });
      const res = await request(app).post("/locations").send({
        locationId: "LOC-001",
        name: "Duplicate",
        address: "Somewhere",
        chargers: [],
      });
      assert.equal(res.status, 409);
    });

    it("Lists all locations on GET /locations (200)", async () => {
      await seedLocation({ locationId: "LOC-001" });
      const res = await request(app).get("/locations");
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.equal(res.body.length, 1);
    });

    it("Fetches a location by locationId on GET /locations/:id for an existing location", async () => {
      await seedLocation({ locationId: "LOC-001" });
      const res = await request(app).get("/locations/LOC-001");
      assert.equal(res.status, 200);
      assert.equal(res.body.locationId, "LOC-001");
    });

    it("Deletes a location on DELETE /locations/:id for an existing location", async () => {
      await seedLocation({ locationId: "LOC-001" });
      const del = await request(app).delete("/locations/LOC-001");
      assert.equal(del.status, 200);

      const get = await request(app).get("/locations/LOC-001");
      assert.equal(get.status, 404);
    });
  });
}
