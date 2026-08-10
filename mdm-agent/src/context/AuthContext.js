import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import {
  employeeLoginRequest,
  employeeRegisterRequest,
  logoutRequest,
} from "../api/endpoints/authApi";
import axiosClient, { setAccessToken } from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // On app launch, try to silently restore a session using whatever
  // refresh token is saved in SecureStore from a previous login
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedRefreshToken = await SecureStore.getItemAsync("refreshToken");
        if (!storedRefreshToken) {
          setCheckingSession(false);
          return;
        }

        const { data } = await axiosClient.post("/auth/refresh-token", {
          refreshToken: storedRefreshToken,
        });

        setAccessToken(data.accessToken);
        await SecureStore.setItemAsync("refreshToken", data.refreshToken);

        // Your refresh-token route only returns tokens, not device info -
        // same gap admin-web had with /auth/me. For now we store what we
        // can reconstruct; consider adding a matching /auth/me-style route
        // for employees later if you need fresher device info on restore.
        const storedDevice = await SecureStore.getItemAsync("deviceInfo");
        if (storedDevice) setDevice(JSON.parse(storedDevice));
      } catch (err) {
        // No valid session - not logged in, that's fine
        await SecureStore.deleteItemAsync("refreshToken");
        await SecureStore.deleteItemAsync("deviceInfo");
      } finally {
        setCheckingSession(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await employeeLoginRequest(email, password);

      setAccessToken(data.accessToken);
      await SecureStore.setItemAsync("refreshToken", data.refreshToken);
      await SecureStore.setItemAsync("deviceInfo", JSON.stringify(data.device));

      setDevice(data.device);
      console.log("Login succeeded, device set:", data.device);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (employeeName, email, password, deviceId) => {
    setError(null);
    setLoading(true);
    try {
      await employeeRegisterRequest(employeeName, email, password, deviceId);
      return { success: true };
    } catch (err) {
       console.log("Register error:", err.response?.data || err.message);
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const storedRefreshToken = await SecureStore.getItemAsync("refreshToken");
    try {
      await logoutRequest(storedRefreshToken);
    } catch (err) {
      // even if the server call fails, clear local state anyway
    }
    setAccessToken(null);
    await SecureStore.deleteItemAsync("refreshToken");
    await SecureStore.deleteItemAsync("deviceInfo");
    setDevice(null);
  };

  return (
    <AuthContext.Provider
      value={{ device, login, register, logout, error, loading, checkingSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}