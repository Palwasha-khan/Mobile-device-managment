import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import { getRecordingPermissionsAsync } from "expo-audio";
import { sendPingRequest } from "../api/endpoints/deviceApi";

export const BACKGROUND_LOCATION_TASK = "background-location-ping";

// IMPORTANT: TaskManager.defineTask must run at the TOP LEVEL of a module
// (not inside a component or function) - it's how Expo registers this task
// with the OS before your app UI even renders. This is why we import this
// file once, early, in App.js - the import itself triggers registration.
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
    // We use the "get" versions here, NOT "request" - a background task has
    // no UI, so it can't show a permission popup. These just read whatever
    // permission state was already granted during normal foreground use.
    const cameraStatus = await Camera.getCameraPermissionsAsync();
    const micStatus = await getRecordingPermissionsAsync();

    await sendPingRequest(
      location.coords.latitude,
      location.coords.longitude,
      cameraStatus.status,
      micStatus.granted ? "granted" : "denied"
    );

    console.log("Background ping sent successfully");
  } catch (err) {
    // A failure here (e.g. token expired, no network) shouldn't crash
    // anything - just log it and let the next scheduled ping try again
    console.log("Background ping failed:", err.message);
  }
});

// Called once after login - starts the actual background tracking
export const startBackgroundLocationTracking = async () => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== "granted") {
    console.log("Foreground location permission not granted yet - skipping background start");
    return;
  }

  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== "granted") {
    console.log("Background location permission denied");
    return;
  }

  const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  if (alreadyStarted) return;

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 1 * 60 * 1000, // ping roughly every 5 minutes
    distanceInterval: 0, // don't require movement - ping on a timer regardless
    showsBackgroundLocationIndicator: true, // iOS shows a blue bar when tracking - honest to the user
    foregroundService: {
      notification: {
        title: "MDM Tracking Active",
        body: "Sending periodic compliance pings to your organization.",
      },
    },
  });
};

// Called on logout - stops tracking entirely
export const stopBackgroundLocationTracking = async () => {
  const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  if (alreadyStarted) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
};