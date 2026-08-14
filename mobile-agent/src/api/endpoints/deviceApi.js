import axiosClient from "../axiosClient";

export const getMyCommandsRequest = () => axiosClient.get("/device/my-commands");

export const sendPingRequest = (lat, lng, cameraPermission, microphonePermission) =>
  axiosClient.post("/device/ping", { lat, lng, cameraPermission, microphonePermission });

export const clearAllCommandsRequest = () => axiosClient.patch("/device/my-commands/clear-all");
export const clearOneCommandRequest = (commandId) => axiosClient.delete(`/device/my-commands/${commandId}`);