import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import {
  getMyCommandsRequest,
  clearAllCommandsRequest,
  clearOneCommandRequest,
} from "../api/endpoints/deviceApi";
import { colors, spacing, radius } from "../utils/theme";

const commandMeta = {
  ring_alert: { icon: "🔔", label: "Device Alert", message: "Your admin triggered a device alert." },
  lock_warning: { icon: "🔒", label: "Security Warning", message: "Your device was flagged for a security review." },
  compliance_warning: {
    icon: "⚠️",
    label: "Compliance Warning",
    message: "This device is not meeting company compliance requirements.",
  },
};

export default function NotificationsScreen({ navigation }) {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCommands = useCallback(async () => {
    try {
      const { data } = await getMyCommandsRequest();
      setCommands(data.commands);
    } catch (err) {
      console.log("Failed to load notifications:", err.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchCommands();
      setLoading(false);
    })();
  }, [fetchCommands]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCommands();
    setRefreshing(false);
  };

  const handleClearAll = () => {
    if (commands.length === 0) return;
    Alert.alert("Clear all notifications?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: async () => {
          try {
            await clearAllCommandsRequest();
            setCommands([]);
          } catch (err) {
            Alert.alert("Error", "Failed to clear notifications.");
          }
        },
      },
    ]);
  };

  const handleClearOne = async (commandId) => {
    try {
      await clearOneCommandRequest(commandId);
      setCommands((prev) => prev.filter((c) => c._id !== commandId));
    } catch (err) {
      Alert.alert("Error", "Failed to clear notification.");
    }
  };

  const renderItem = ({ item }) => {
    const meta = commandMeta[item.commandType] || { icon: "📩", label: "Notification", message: "" };
    return (
      <View style={styles.card}>
        <Text style={styles.icon}>{meta.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{meta.label}</Text>
          <Text style={styles.cardMessage}>{meta.message}</Text>
          <Text style={styles.cardTime}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        <TouchableOpacity onPress={() => handleClearOne(item._id)} style={styles.dismissButton}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.empty}>Loading...</Text>
      ) : (
        <FlatList
          data={commands}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.lg }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
  },
  backArrow: { color: colors.primary, fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  clearAllText: { color: colors.danger, fontWeight: "600", fontSize: 13 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: { fontSize: 24, marginRight: spacing.sm },
  cardTitle: { fontWeight: "700", color: colors.textPrimary, marginBottom: 2 },
  cardMessage: { color: colors.textSecondary, fontSize: 13, marginBottom: 4 },
  cardTime: { color: colors.textSecondary, fontSize: 11 },
  dismissButton: { padding: spacing.xs },
  dismissText: { color: colors.textSecondary, fontSize: 16 },
  empty: { textAlign: "center", color: colors.textSecondary, marginTop: spacing.xl },
});