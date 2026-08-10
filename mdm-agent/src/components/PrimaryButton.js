import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../utils/theme";

export default function PrimaryButton({ onPress, title, loading, disabled, variant = "primary" }) {
  const isDanger = variant === "danger";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: isDanger ? colors.danger : colors.primary },
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: spacing.md - 2,
    borderRadius: radius.md,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  text: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.5 },
});