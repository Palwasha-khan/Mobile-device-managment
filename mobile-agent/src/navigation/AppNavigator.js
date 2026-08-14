import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import PendingApprovalScreen from "../screens/PendingApprovalScreen";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import LoadingSpinner from "../components/LoadingSpinner";
import NotificationsScreen from "../screens/NotificationsScreen";
import { setupNotificationResponseListener, checkLastNotificationResponse } from "../utils/registerPushToken";
import { useEffect, useRef } from "react";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { device, checkingSession } = useAuth();
  const navigationRef = useRef(null);

  useEffect(() => {
    const unsubscribe = setupNotificationResponseListener(navigationRef);
    checkLastNotificationResponse(navigationRef);
    return unsubscribe;
  }, []);

  if (checkingSession) {
    return  <LoadingSpinner />;
  }

  return (
    <NavigationContainer  ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {device ? ( 
          device.isApproved === false ? (
            <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
          ) : (
            <>
            <Stack.Screen name="Home" component={HomeScreen} />
             <Stack.Screen name="Settings" component={SettingsScreen} />
             <Stack.Screen name="Notifications" component={NotificationsScreen} />
            </>
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});