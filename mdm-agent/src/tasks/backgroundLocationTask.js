import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import { getRecordingPermissionsAsync } from "expo-audio";
import { sendPingRequest } from "../api/endpoints/deviceApi";

export const BACKGROUND_LOCATION_TASK = "background-location-ping";
export const checkBackgroundLocationGranted = async () => {
  const { status } = await Location.getBackgroundPermissionsAsync();
  return status === "granted";
};
 
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.log("Background location task error:", error);
    return;
  }

  if (!data) return;

  const { locations } = data;
  const location = locations?.[0];
  if (!location) return;

  try {
    // "get" not "request" - no UI available in a background task
    const cameraStatus = await Camera.getCameraPermissionsAsync();
    const micStatus = await getRecordingPermissionsAsync();

    const cameraPermission = cameraStatus.status === "granted" ? "granted" : "denied";
    const microphonePermission = micStatus.granted ? "granted" : "denied";

    await sendPingRequest(
      location.coords.latitude,
      location.coords.longitude,
       cameraPermission,
       microphonePermission
    );

    console.log("Background ping sent successfully");
  } catch (err) {
    console.log("Background ping failed:", err.response?.data || err.message);
  }
});

export const startBackgroundLocationTracking = async () => {
  try {
    console.log("Step 1: requesting foreground permission");
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    console.log("Foreground status:", foregroundStatus);
    if (foregroundStatus !== "granted") {
      console.log("Foreground location permission denied - skipping background start");
      return;
    }

    console.log("Step 2: requesting background permission");
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    console.log("Background status:", backgroundStatus);
    if (backgroundStatus !== "granted") {
      console.log("Background location permission denied");
      return;
    }

    console.log("Step 3: checking if already started");
    const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    console.log("Already started?", alreadyStarted);
    if (alreadyStarted) {
      console.log("Background location tracking already running");
      return;
    }

    console.log("Step 4: calling startLocationUpdatesAsync");
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 30 * 1000,
      distanceInterval: 0,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notification: {
          title: "MDM Tracking Active",
          body: "Sending periodic compliance pings to your organization.",
        },
      },
    });

    console.log("Background location tracking started");
  } catch (err) {
    console.log("startBackgroundLocationTracking CRASHED:", err.message);
  }
};
export const stopBackgroundLocationTracking = async () => {
  const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  if (alreadyStarted) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    console.log("Background location tracking stopped");
  }
};