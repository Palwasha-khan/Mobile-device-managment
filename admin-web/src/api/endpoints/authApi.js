import axiosClient from "../axiosClient";

export const loginRequest = (email, password) =>
  axiosClient.post("/auth/login", { email, password });

export const logoutRequest = () => axiosClient.post("/auth/logout");

export const refreshRequest = () => axiosClient.post("/auth/refresh-token");

export const createAdmin = (name, email, password) =>
  axiosClient.post("/auth/create-admin", { name, email, password });
