import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { GoalsProvider } from "../context/GoalsContext";
import { AccountsProvider } from "../context/AccountsContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AccountsProvider>
          <GoalsProvider>
            <StatusBar style="light" />
            <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#f1f4f6" },
            }}
          />
          </GoalsProvider>
        </AccountsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
