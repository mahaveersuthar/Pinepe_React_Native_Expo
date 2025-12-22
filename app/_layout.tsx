import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import Toast from 'react-native-toast-message';

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { secureStorage } from "@/services/secureStorage";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import SplashScreen from "@/app/splash";

function RootNavigator() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [hasOpened, setHasOpened] = useState<boolean | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const opened = await secureStorage.getHasOpened();
        setHasOpened(!!opened);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setHasOpened(false);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };
    checkOnboarding();
  }, []);

  const isLoading = authLoading || isCheckingOnboarding;
  
  if (showSplash || isLoading) {
    return (
      <SplashScreen 
        onComplete={() => {
          if (!isLoading) {
            setShowSplash(false);
          }
        }} 
      />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!hasOpened && <Stack.Screen name="onboarding" />}
      {hasOpened && !isAuthenticated && <Stack.Screen name="(auth)" />}
      {hasOpened && isAuthenticated && <Stack.Screen name="(tabs)" />}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="auto" />
      <Toast /> 
    </AuthProvider>
  );
}