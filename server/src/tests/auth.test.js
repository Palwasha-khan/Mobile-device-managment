import request from "supertest";
import app from "../app.js";
import Device from "../models/Device.js";
import { hashPassword } from "../utils/crypto.js";
import "./setup.js";

describe("Employee login", () => {
  test("blocks login when status is pending", async () => {
    const hashedPassword = await hashPassword("employee123");

    await Device.create({
      employeeName: "Test Employee",
      email: "pending@company.com",
      password: hashedPassword,
      deviceId: "DEVICE-001",
      status: "pending",
    });

    const response = await request(app)
      .post("/api/auth/employee-login")
      .send({ email: "pending@company.com", password: "employee123" });

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("approval");
  });

  test("allows login when status is approved", async () => {
    const hashedPassword = await hashPassword("employee123");

    await Device.create({
      employeeName: "Test Employee",
      email: "approved@company.com",
      password: hashedPassword,
      deviceId: "DEVICE-002",
      status: "approved",
    });

    const response = await request(app)
      .post("/api/auth/employee-login")
      .send({ email: "approved@company.com", password: "employee123" });

    expect(response.status).toBe(200);
    expect(typeof response.body.accessToken).toBe("string");
    expect(response.body.accessToken.length).toBeGreaterThan(0);
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  test("refresh token stops working after logout", async () => {
    const hashedPassword = await hashPassword("employee123");

    await Device.create({
      employeeName: "Test Employee",
      email: "logout-test@company.com",
      password: hashedPassword,
      deviceId: "DEVICE-003",
      status: "approved",
    });

    // 1. Log in and grab the refresh token cookie
    const loginResponse = await request(app)
      .post("/api/auth/employee-login")
      .send({ email: "logout-test@company.com", password: "employee123" });

    const cookie = loginResponse.headers["set-cookie"];
    expect(cookie).toBeDefined();

    // 2. Log out, sending that same cookie
    const logoutResponse = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookie);

    expect(logoutResponse.status).toBe(200);

    // 3. Try to refresh using the SAME (now-revoked) cookie
    const refreshResponse = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", cookie);

    expect(refreshResponse.status).toBe(401);
  });
});