import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, loading } = useAuth();

  const handleLogin = async () => {
    // No manual navigation needed on success - AppNavigator (Phase 2, next
    // file) watches `device` state and swaps screens automatically
    await login(email, password);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Employee Login</Text>

      <TextInput
        style={styles.input}
        placeholder="employee@company.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>New employee? Register here</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f4f6f8" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 24, textAlign: "center" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: "#2563eb", padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 16 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  error: { color: "red", marginBottom: 12, textAlign: "center" },
  link: { color: "#2563eb", textAlign: "center" },
});