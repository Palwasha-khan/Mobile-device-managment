import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import { Audio } from "expo-audio";
import { useAuth } from "../context/AuthContext";
import { sendPingRequest } from "../api/endpoints/deviceApi";

export default function HomeScreen() {
  const { device, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [permissionsStatus, setPermissionsStatus] = useState(null);
  const [pingResult, setPingResult] = useState(null);

  const handleSendPing = async () => {
    setLoading(true);
    try {
      // 1. Request Location Permissions & Coords
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      let lat = null;
      let lng = null;

      if (locStatus === "granted") {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      }

     // 2. Request Camera Permissions

     const cameraPerm = await Camera.requestCameraPermissionsAsync();

      let micGranted = false;
      if (typeof Camera.requestMicrophonePermissionsAsync === "function") {
        const micPerm = await Camera.requestMicrophonePermissionsAsync();
        micGranted = micPerm.granted;
      }

      const cameraPermission = cameraPerm.granted ? "granted" : "denied";
      const microphonePermission = micGranted ? "granted" : "denied";
      setPermissionsStatus({
        location: locStatus === "granted" ? "GRANTED" : "DENIED",
        camera: cameraPermission,
        microphone: microphonePermission,
      });

      // 3. Trigger Ping with matching signature: (lat, lng, cameraPermission, microphonePermission)
      const response = await sendPingRequest(
        lat,
        lng,
        cameraPermission,
        microphonePermission
      );

      setPingResult({
        success: true,
        data: response.data,
        time: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to send ping";
      Alert.alert("Ping Error", errorMsg);
      setPingResult({
        success: false,
        error: errorMsg,
        time: new Date().toLocaleTimeString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Device Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📱 Device Information</Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>Employee: </Text>
          {device?.employeeName || device?.email || "Active User"}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>Device ID: </Text>
          {device?.id || device?.deviceId || "N/A"}
        </Text>
      </View>

      {/* Ping Trigger Button */}
      <TouchableOpacity
        style={[styles.pingButton, loading && styles.buttonDisabled]}
        onPress={handleSendPing}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.pingButtonText}>📡 Send Manual Ping</Text>
        )}
      </TouchableOpacity>

      {/* Permissions Audit */}
      {permissionsStatus && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔒 Hardware Permissions</Text>
          <Text style={styles.infoText}>Location: {permissionsStatus.location}</Text>
          <Text style={styles.infoText}>Camera: {permissionsStatus.camera}</Text>
          <Text style={styles.infoText}>Microphone: {permissionsStatus.microphone}</Text>
        </View>
      )}

      {/* Compliance Ping Output */}
      {pingResult && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Server Compliance Response</Text>
          <Text style={styles.infoText}>Timestamp: {pingResult.time}</Text>
          <Text style={styles.infoText}>
            Status: {pingResult.success ? "🟢 Success" : "🔴 Error"}
          </Text>
          {pingResult.data && (
            <View style={styles.codeBox}>
              <Text style={styles.jsonText}>
                {JSON.stringify(pingResult.data, null, 2)}
              </Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, backgroundColor: "#f4f6f8", flexGrow: 1 },
  card: { backgroundColor: "#fff", borderRadius: 8, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  infoText: { fontSize: 14, color: "#374151", marginBottom: 4 },
  label: { fontWeight: "600" },
  pingButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: { backgroundColor: "#93c5fd" },
  pingButtonText: { color: "#fff", fontWeight: "bold" },
  logoutButton: { padding: 12, alignItems: "center", marginTop: "auto" },
  logoutText: { color: "#dc2626", fontWeight: "600" },
  codeBox: { backgroundColor: "#1e293b", padding: 10, borderRadius: 6, marginTop: 8 },
  jsonText: { color: "#38bdf8", fontFamily: "monospace", fontSize: 12 },
});