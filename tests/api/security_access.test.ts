import request from "supertest";
import { createTestApp } from "../testApp";
import { authHeader, loginAs } from "../testUtils";

const app = createTestApp();

describe("Security access controls", () => {
  it("rejects unauthenticated withdrawal request", async () => {
    const res = await request(app)
      .post("/api/withdrawals/request")
      .send({ amount: 5000, method: "bank_transfer", bankAccount: "123" });

    expect(res.status).toBe(401);
  });

  it("rejects customer access to admin withdrawals", async () => {
    const token = await loginAs(app, "test-customer");

    const res = await request(app)
      .get("/api/withdrawals/admin/pending")
      .set(authHeader(token));

    expect(res.status).toBe(403);
  });

  it("rejects customer access to admin weekly settlements", async () => {
    const token = await loginAs(app, "test-customer");

    const res = await request(app)
      .get("/api/weekly-settlement/admin/pending")
      .set(authHeader(token));

    expect(res.status).toBe(403);
  });

  it("rejects customer access to cron settlement endpoints", async () => {
    const token = await loginAs(app, "test-customer");

    const res = await request(app)
      .post("/api/weekly-settlement/cron/close-week")
      .set(authHeader(token));

    expect(res.status).toBe(403);
  });

  it("rejects viewing another user's withdrawal history", async () => {
    const token = await loginAs(app, "test-customer");

    const res = await request(app)
      .get("/api/withdrawals/history/test-driver")
      .set(authHeader(token));

    expect(res.status).toBe(403);
  });
});
