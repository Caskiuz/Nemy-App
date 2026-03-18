import request from "supertest";
import { createTestApp } from "../testApp";
import { authHeader, loginAs } from "../testUtils";

const app = createTestApp();

describe("Addresses E2E flow", () => {
  const userId = "test-customer";

  it("creates, edits, sets default, and deletes addresses", async () => {
    const token = await loginAs(app, userId);
    const unique = Date.now();
    const primaryLabel = `Casa QA ${unique}`;
    const secondaryLabel = `Trabajo QA ${unique}`;
    const secondaryEditedLabel = `Trabajo QA Editado ${unique}`;

    const createPrimary = await request(app)
      .post(`/api/users/${userId}/addresses`)
      .set(authHeader(token))
      .send({
        label: primaryLabel,
        street: `Calle QA ${unique} #10`,
        city: "Autlán",
        state: "Jalisco",
        zipCode: "48900",
        latitude: 19.7708,
        longitude: -104.3636,
        isDefault: false,
      });

    expect(createPrimary.status).toBe(200);
    expect(createPrimary.body).toHaveProperty("success", true);

    const createSecondaryCompat = await request(app)
      .post("/api/addresses")
      .set(authHeader(token))
      .send({
        label: secondaryLabel,
        street: `Avenida QA ${unique} #20`,
        city: "Autlán",
        state: "Jalisco",
        zipCode: "48900",
        latitude: 19.771,
        longitude: -104.364,
        isDefault: false,
      });

    expect(createSecondaryCompat.status).toBe(200);
    expect(createSecondaryCompat.body).toHaveProperty("success", true);

    const listAfterCreate = await request(app)
      .get(`/api/users/${userId}/addresses`)
      .set(authHeader(token));

    expect(listAfterCreate.status).toBe(200);
    const createdAddresses = listAfterCreate.body.addresses as Array<any>;
    const primaryAddress = createdAddresses.find((addr) => addr.label === primaryLabel);
    const secondaryAddress = createdAddresses.find((addr) => addr.label === secondaryLabel);

    expect(primaryAddress).toBeTruthy();
    expect(secondaryAddress).toBeTruthy();

    const primaryId = primaryAddress.id as string;
    const secondaryId = secondaryAddress.id as string;

    const editSecondary = await request(app)
      .put(`/api/users/${userId}/addresses/${secondaryId}`)
      .set(authHeader(token))
      .send({
        label: secondaryEditedLabel,
        street: `Avenida QA Editada ${unique} #99`,
      });

    expect(editSecondary.status).toBe(200);
    expect(editSecondary.body).toHaveProperty("success", true);
    expect(editSecondary.body.address.street).toContain("Editada");

    const setDefaultCompat = await request(app)
      .patch(`/api/addresses/${secondaryId}/default`)
      .set(authHeader(token));

    expect(setDefaultCompat.status).toBe(200);
    expect(setDefaultCompat.body).toHaveProperty("success", true);

    const listAfterDefault = await request(app)
      .get(`/api/users/${userId}/addresses`)
      .set(authHeader(token));

    expect(listAfterDefault.status).toBe(200);
    expect(listAfterDefault.body).toHaveProperty("success", true);
    expect(Array.isArray(listAfterDefault.body.addresses)).toBe(true);

    const addresses = listAfterDefault.body.addresses as Array<any>;
    const secondary = addresses.find((addr) => addr.id === secondaryId);

    expect(secondary).toBeTruthy();
    expect(secondary.isDefault === true || secondary.isDefault === 1).toBe(true);

    const deletePrimaryCompat = await request(app)
      .delete(`/api/addresses/${primaryId}`)
      .set(authHeader(token));

    expect(deletePrimaryCompat.status).toBe(200);
    expect(deletePrimaryCompat.body).toHaveProperty("success", true);

    const listAfterDelete = await request(app)
      .get(`/api/users/${userId}/addresses`)
      .set(authHeader(token));

    expect(listAfterDelete.status).toBe(200);
    const remaining = listAfterDelete.body.addresses as Array<any>;
    expect(remaining.some((addr) => addr.id === primaryId)).toBe(false);
    expect(remaining.some((addr) => addr.id === secondaryId && addr.label === secondaryEditedLabel)).toBe(true);

    await request(app)
      .delete(`/api/addresses/${secondaryId}`)
      .set(authHeader(token));
  });

  it("prevents accessing another user's addresses", async () => {
    const token = await loginAs(app, userId);

    const res = await request(app)
      .get("/api/users/test-driver/addresses")
      .set(authHeader(token));

    expect(res.status).toBe(403);
  });
});