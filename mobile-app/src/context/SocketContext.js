import { createContext, useContext, useEffect, useRef } from "react";
import { Vibration, Alert } from "react-native";
import socket from "../api/socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { device } = useAuth();
  const registeredRef = useRef(false);

  useEffect(() => {
    const deviceId = device?.id || device?._id;

    if (!deviceId) { 
      if (socket.connected) {
        socket.disconnect();
      }
      registeredRef.current = false;
      return;
    }

    const registerDevice = () => {
      socket.emit("register-device", deviceId);
      registeredRef.current = true;
    };

    if (!socket.connected) {
      socket.connect();
    } else if (!registeredRef.current) {
      registerDevice();
    }

    socket.on("connect", registerDevice);

    const handleCommand = (payload) => {
      if (payload.commandType === "ring_alert") {
        Vibration.vibrate([0, 400, 200, 400]);
        Alert.alert("Alert", "Your admin has triggered a device alert.");
      } else if (payload.commandType === "lock_warning") {
        Vibration.vibrate(500);
        Alert.alert("Lock Warning", "Your IT admin has flagged this device for a security review.");
      } else if (payload.commandType === "compliance_warning") {
        Alert.alert(
          "Compliance Warning",
          "This device is not meeting company compliance requirements. Please review your permission settings."
        );
      }
    };

    socket.on("command", handleCommand); 
    return () => {
      socket.off("connect", registerDevice);
      socket.off("command", handleCommand);
    };
  }, [device]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}