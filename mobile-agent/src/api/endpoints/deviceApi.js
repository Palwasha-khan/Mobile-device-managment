import axiosClient from "../axiosClient";

export const sendPingRequest = (lat, lng, cameraPermission, microphonePermission) =>
  axiosClient.post("/device/ping", { lat, lng, cameraPermission, microphonePermission });