import axiosClient from "../axiosClient";

export const employeeLoginRequest = (email, password) =>
  axiosClient.post("/auth/employee-login", { email, password });

export const employeeRegisterRequest = (employeeName, email, password, deviceId) =>
  axiosClient.post("/auth/employee-register", { employeeName, email, password, deviceId });

export const logoutRequest = (refreshToken) =>
  axiosClient.post("/auth/logout", { refreshToken });