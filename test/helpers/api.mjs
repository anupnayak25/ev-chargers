export function postLocation(request, app, payload) {
  return request(app).post("/locations").send(payload);
}

export function postCharger(request, app, locationId, payload) {
  return request(app)
    .post(`/locations/${encodeURIComponent(locationId)}/chargers`)
    .send(payload);
}

export function postConnector(request, app, locationId, chargerId, payload) {
  return request(app)
    .post(`/locations/${encodeURIComponent(locationId)}/chargers/${encodeURIComponent(chargerId)}/connectors`)
    .send(payload);
}
