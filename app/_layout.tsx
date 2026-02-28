import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { AuthProvider } from "@/context/AuthContext";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { BrandingProvider } from '@/context/BrandingContext';
import { ThemeProvider } from "@/context/ThemeProvider";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#2ecc71', height: 'auto', minHeight: 60, paddingVertical: 10 }}
      text1NumberOfLines={3}
      text2NumberOfLines={3}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#e74c3c', height: 'auto', minHeight: 60, paddingVertical: 10 }}
      text1NumberOfLines={3}
      text2NumberOfLines={3}
    />
  ),
};
// This helps the APK know where to start
export const unstable_settings = {
  initialRouteName: "index",
};

// MUST BE DEFAULT EXPORT
export default function RootLayout() {
  useFrameworkReady();

  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
    <ThemeProvider>
    <BrandingProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" /> 
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
        <Toast config={toastConfig}/> 
      </AuthProvider>
    </BrandingProvider>
    </ThemeProvider>
    </GestureHandlerRootView>
  );
}