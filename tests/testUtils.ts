import request from "supertest";

export async function loginAs(app: any, userId: string) {
  const res = await request(app).post("/api/auth/dev-login").send({ userId });
  if (res.status !== 200) {
    throw new Error(`dev-login failed for ${userId}: ${res.status}`);
  }
  return res.body.token as string;
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
