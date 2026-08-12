import { View, Text, StyleSheet } from "react-native";
import { colors, radius } from "../utils/theme";

export default function StatusBadge({ isCompliant }) {
  return (
    <View style={[styles.badge, { backgroundColor: isCompliant ? colors.successBg : colors.dangerBg }]}>
      <Text style={[styles.text, { color: isCompliant ? colors.success : colors.danger }]}>
        {isCompliant ? "Compliant" : "Non-Compliant"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, alignSelf: "flex-start" },
  text: { fontSize: 12, fontWeight: "700" },
});