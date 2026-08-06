import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import PrimaryButton from "../components/PrimaryButton";
import { colors, spacing, radius } from "../utils/theme";

export default function SettingsScreen({ navigation }) {
  const { device, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Employee Name</Text>
          <Text style={styles.value}>{device?.employeeName}</Text>
          <Text style={styles.label}>Device ID</Text>
          <Text style={styles.value}>{device?.deviceId}</Text>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{device?.status}</Text>
        </View>

        <PrimaryButton title="Logout" onPress={handleLogout} variant="danger" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  backArrow: { color: colors.primary, fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.sm },
  value: { fontSize: 15, color: colors.textPrimary, fontWeight: "600" },
});