import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { generateAccessToken } from "../utils/generateTokens.js";
import "./setup.js";

describe("protect middleware", () => {
  test("rejects a request with no Authorization header", async () => {
    const response = await request(app).get("/api/device/pending");
    expect(response.status).toBe(401);
  });

  test("rejects a request with a garbage token", async () => {
    const response = await request(app)
      .get("/api/device/pending")
      .set("Authorization", "Bearer not-a-real-token");
    expect(response.status).toBe(401);
  });

  test("rejects a request with an expired token", async () => {
    const expiredToken = jwt.sign(
      { id: "someFakeId", role: "admin" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "-10s" } // already expired the moment it's created
    );

    const response = await request(app)
      .get("/api/device/pending")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });
});

describe("requireRole middleware", () => {
  test("blocks an employee-role token from an admin-only route", async () => {
    const employeeToken = generateAccessToken("someFakeEmployeeId", "employee");

    const response = await request(app)
      .get("/api/device/pending")
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(response.status).toBe(403); // Forbidden, not 401 Unauthorized
  });
});