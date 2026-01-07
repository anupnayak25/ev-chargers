export async function expectStatus(promise, assert, expectedStatus) {
  const res = await promise;
  assert.equal(res.status, expectedStatus);
  return res;
}

export function expectArray(value, assert) {
  assert.ok(Array.isArray(value));
  return value;
}

export function expectArrayLength(value, assert, expectedLength) {
  expectArray(value, assert);
  assert.equal(value.length, expectedLength);
  return value;
}

export function expectSome(value, assert, predicate) {
  expectArray(value, assert);
  assert.ok(value.some(predicate));
  return value;
}
