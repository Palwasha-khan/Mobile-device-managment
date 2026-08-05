import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import { requestRecordingPermissionsAsync } from "expo-audio";
import { useAuth } from "../context/AuthContext";
import { sendPingRequest } from "../api/endpoints/deviceApi";

export default function HomeScreen() {
  const { device, logout } = useAuth();
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleSendPing = async () => {
    setSending(true);
    setLastResult(null);
    try {
      // 1. Location permission + coordinates
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== "granted") {
        Alert.alert("Permission needed", "Location permission is required to send a ping.");
        setSending(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 2. Camera permission
      const cameraResult = await Camera.requestCameraPermissionsAsync();
      const cameraPermission = cameraResult.status; // "granted" or "denied"

      // 3. Microphone permission
      const micResult = await requestRecordingPermissionsAsync();
      const microphonePermission = micResult.granted ? "granted" : "denied";

      // 4. Send everything to the backend
      const response = await sendPingRequest(latitude, longitude, cameraPermission, microphonePermission);

      setLastResult(response.data.device);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to send ping. Check your connection.";
      Alert.alert("Error", message);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enrollment Status</Text>
      <Text style={styles.info}>Employee: {device?.employeeName}</Text>
      <Text style={styles.info}>Device ID: {device?.deviceId}</Text>
      <Text style={styles.statusConnected}>● Connected to server</Text>

      <TouchableOpacity style={styles.button} onPress={handleSendPing} disabled={sending}>
        {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Test Location</Text>}
      </TouchableOpacity>

      {lastResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Last ping saved on server:</Text>
          <Text>Lat: {lastResult.lastKnownLocation.lat}</Text>
          <Text>Lng: {lastResult.lastKnownLocation.lng}</Text>
          <Text>At: {new Date(lastResult.lastPingAt).toLocaleTimeString()}</Text>
          <Text style={{ marginTop: 8, fontWeight: "600" }}>Camera: {lastResult.permissions?.camera}</Text>
          <Text style={{ fontWeight: "600" }}>Microphone: {lastResult.permissions?.microphone}</Text>
          <Text
            style={{
              marginTop: 8,
              fontWeight: "bold",
              color: lastResult.isCompliant ? "#16a34a" : "#dc2626",
            }}
          >
            Status: {lastResult.isCompliant ? "Compliant" : "Non-Compliant"}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: "#f4f6f8" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  info: { fontSize: 14, color: "#333", marginBottom: 4 },
  statusConnected: { color: "green", marginBottom: 24, fontWeight: "600" },
  button: { backgroundColor: "#2563eb", padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 20 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  resultBox: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 20 },
  resultTitle: { fontWeight: "bold", marginBottom: 6 },
  logoutButton: { marginTop: "auto", alignItems: "center", padding: 12 },
  logoutText: { color: "#999" },
});