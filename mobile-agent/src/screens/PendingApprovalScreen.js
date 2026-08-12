import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PendingApprovalScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
    <View style={styles.container}>
      <Text style={styles.icon}>⏳</Text>
      <Text style={styles.title}>Registration Submitted</Text>
      <Text style={styles.message}>
        Your account is awaiting admin approval. You'll be able to log in once an
        admin reviews your registration. Check your email for updates.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.buttonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#f4f6f8" },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  message: { color: "#555", textAlign: "center", marginBottom: 24, lineHeight: 20 },
  button: { backgroundColor: "#2563eb", padding: 14, borderRadius: 8, paddingHorizontal: 32 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});