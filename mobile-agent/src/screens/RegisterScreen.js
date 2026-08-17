import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen({ navigation }) {
  const [employeeName, setEmployeeName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const { register, error, loading } = useAuth();

  const handleRegister = async () => {
    const result = await register(employeeName, email, password, deviceId);
    if (result.success) {
      navigation.navigate("PendingApproval");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
    <View style={styles.container}>
      <Text style={styles.title}>Employee Registration</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} placeholder="Full Name" value={employeeName} onChangeText={setEmployeeName} />
      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="employee@company.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Text style={styles.label}>Device ID</Text>
      <TextInput style={styles.input} placeholder="Device ID (e.g. DEV-001)" value={deviceId} onChangeText={setDeviceId} />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View></SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f4f6f8" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 24, textAlign: "center" },
 label: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#334155", 
    marginBottom: 6 
  },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 16 ,color: "#0f172a"},
  button: { backgroundColor: "#2563eb", padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 16 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  error: { color: "red", marginBottom: 12, textAlign: "center" },
  link: { color: "#2563eb", textAlign: "center" },
});