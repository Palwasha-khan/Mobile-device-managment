import { View, Text, StyleSheet } from "react-native";
import { Linking, Platform } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { colors, spacing, radius } from "../utils/theme";

export default function BackgroundPermissionScreen({ onContinue }) {
  const openSettings = () => {
    if (Platform.OS === "android") {
      Linking.openSettings();
    } else {
      Linking.openURL("app-settings:");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📍</Text>
      <Text style={styles.title}>Background Location Needed</Text>
      <Text style={styles.message}>
        To keep sending compliance pings while the app isn't open, this app needs
        "Allow all the time" location access.{"\n\n"}
        Tap the button below, then go to Permissions → Location → and select
        "Allow all the time".
      </Text>

      <PrimaryButton title="Open Settings" onPress={openSettings} />
      <PrimaryButton title="I've done this - Continue" onPress={onContinue} variant="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background },
  icon: { fontSize: 48, textAlign: "center", marginBottom: spacing.md },
  title: { fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: spacing.md, color: colors.textPrimary },
  message: { color: colors.textSecondary, textAlign: "center", marginBottom: spacing.lg, lineHeight: 20 },
});