import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import { requestRecordingPermissionsAsync } from "expo-audio";
import { useAuth } from "../context/AuthContext";
import { sendPingRequest } from "../api/endpoints/deviceApi";
import { startBackgroundLocationTracking, stopBackgroundLocationTracking ,checkBackgroundLocationGranted} from "../tasks/backgroundLocationTask";
import PrimaryButton from "../components/PrimaryButton";
import StatusBadge from "../components/StatusBadge";
import { colors, spacing, radius } from "../utils/theme";
import BackgroundPermissionScreen from "./BackgroundPermissionScreen";
import { registerForPushNotifications } from "../utils/registerPushToken";
import * as Notifications from "expo-notifications";
 


export default function HomeScreen({ navigation }) {



  const { device, logout } = useAuth();
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [needsBackgroundPermission, setNeedsBackgroundPermission] = useState(false);


 useEffect(() => {
  const initTracking = async () => {
    try {
      await registerForPushNotifications(); // replaces the standalone permission request

      const hasBackground = await checkBackgroundLocationGranted();
      console.log("Background permission already granted?", hasBackground);
      if (!hasBackground) {
        setNeedsBackgroundPermission(true);
      } else {
        startBackgroundLocationTracking();
      }
    } catch (err) {
      console.log("Error checking background permission:", err.message);
    }
  };
  initTracking();
}, []);

  

  const handleSendPing = async () => {
    setSending(true);
    setErrorMessage(null);
    try {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== "granted") {
        setErrorMessage("Location permission is required to send a ping.");
        setSending(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const cameraResult = await Camera.requestCameraPermissionsAsync();
      const micResult = await requestRecordingPermissionsAsync();

      const response = await sendPingRequest(
        latitude,
        longitude,
        cameraResult.status,
        micResult.granted ? "granted" : "denied"
      );

      setLastResult(response.data.device);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to send ping. Check your connection.");
    } finally {
      setSending(false);
    }
  };

 const handleContinueAfterSettings = async () => {
  try {
    const hasBackground = await checkBackgroundLocationGranted();
    console.log("Recheck after settings - hasBackground:", hasBackground);
    setNeedsBackgroundPermission(false);
    if (hasBackground) {
      await startBackgroundLocationTracking();
    }
  } catch (err) {
    console.log("handleContinueAfterSettings error:", err.message);
    setNeedsBackgroundPermission(false);
  }
};

  const handleLogout = async () => {
    await stopBackgroundLocationTracking();
    await logout();
  };
 
  if (needsBackgroundPermission) {
  return <BackgroundPermissionScreen onContinue={handleContinueAfterSettings} />;
}
  return (

   
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.title}>{device?.employeeName}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <TouchableOpacity onPress={() => navigation.navigate("Notifications")} style={styles.settingsButton}>
              <Text style={styles.settingsIcon}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={styles.settingsButton}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Device ID</Text>
          <Text style={styles.value}>{device?.deviceId}</Text>
          <View style={styles.connectedRow}>
            <View style={styles.dot} />
            <Text style={styles.connectedText}>Connected to server</Text>
          </View>
        </View>

        <PrimaryButton title="Send Test Location" onPress={handleSendPing} loading={sending} />

        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

        {lastResult && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Last ping saved on server</Text>
            <Text style={styles.value}>Lat: {lastResult.lastKnownLocation.lat}</Text>
            <Text style={styles.value}>Lng: {lastResult.lastKnownLocation.lng}</Text>
            <Text style={styles.value}>At: {new Date(lastResult.lastPingAt).toLocaleTimeString()}</Text>
            <Text style={[styles.label, { marginTop: spacing.sm }]}>Camera: {lastResult.permissions?.camera}</Text>
            <Text style={styles.label}>Microphone: {lastResult.permissions?.microphone}</Text>
            <View style={{ marginTop: spacing.sm }}>
              <StatusBadge isCompliant={lastResult.isCompliant} />
            </View>
          </View>
        )}

        <PrimaryButton title="Logout" onPress={handleLogout} variant="danger" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, paddingTop: spacing.md },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  greeting: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
  title: { fontSize: 22, fontWeight: "700", color: colors.textPrimary },
  settingsButton: {
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsIcon: { fontSize: 18 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontWeight: "700", marginBottom: spacing.sm, color: colors.textPrimary },
  label: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.sm },
  value: { fontSize: 15, color: colors.textPrimary, fontWeight: "600" },
  connectedRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: 6 },
  connectedText: { color: colors.success, fontWeight: "600", fontSize: 13 },
  error: { color: colors.danger, marginBottom: spacing.md, textAlign: "center" },
});