import { describe, it } from "node:test";

export function registerLocationTests({ request, app, assert, seedLocation }) {
  describe("Locations routes", () => {
    it("POST /locations creates a location", async () => {
      const res = await request(app).post("/locations").send({
        locationId: "LOC-001",
        name: "Sample Location",
        address: "123 Main St",
        chargers: [],
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.locationId, "LOC-001");
    });

    it("POST /locations rejects missing locationId", async () => {
      const res = await request(app).post("/locations").send({ name: "No ID" });
      assert.equal(res.status, 400);
    });

    it("POST /locations rejects duplicate locationId (409)", async () => {
      await seedLocation({ locationId: "LOC-001" });
      const res = await request(app).post("/locations").send({
        locationId: "LOC-001",
        name: "Duplicate",
        address: "Somewhere",
        chargers: [],
      });
      assert.equal(res.status, 409);
    });

    it("GET /locations lists locations", async () => {
      await seedLocation({ locationId: "LOC-001" });
      const res = await request(app).get("/locations");
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.equal(res.body.length, 1);
    });

    it("GET /locations/:id fetches a location", async () => {
      await seedLocation({ locationId: "LOC-001" });
      const res = await request(app).get("/locations/LOC-001");
      assert.equal(res.status, 200);
      assert.equal(res.body.locationId, "LOC-001");
    });

    it("DELETE /locations/:id deletes a location", async () => {
      await seedLocation({ locationId: "LOC-001" });
      const del = await request(app).delete("/locations/LOC-001");
      assert.equal(del.status, 200);

      const get = await request(app).get("/locations/LOC-001");
      assert.equal(get.status, 404);
    });
  });
}
