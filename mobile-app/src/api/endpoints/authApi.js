import axiosClient from "../axiosClient";

export const employeeLoginRequest = (email, password) =>
  axiosClient.post("/auth/employee-login", { email, password });

export const employeeRegisterRequest = (name, email, password, deviceId) =>
  axiosClient.post("/auth/employee-register", { name, email, password, deviceId });

export const logoutRequest = (refreshToken) =>
  axiosClient.post("/auth/logout", { refreshToken });