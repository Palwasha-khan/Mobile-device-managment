import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import axiosClient from "../api/axiosClient";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission denied");
    return;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: "3e710d9f-8505-4d0a-8b66-2735dff61555",
  });

  const pushToken = tokenData.data;
  console.log("Got push token:", pushToken);

  try {
    await axiosClient.patch("/device/push-token", { pushToken });
    console.log("Push token saved to backend");
  } catch (err) {
    console.log("Failed to save push token:", err.response?.data || err.message);
  }
};