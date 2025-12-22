import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

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

  // Show splash for minimum 3 seconds OR until loading completes (whichever is longer)
  const isLoading = authLoading || isCheckingOnboarding;
  
  if (showSplash || isLoading) {
    return (
      <SplashScreen 
        onComplete={() => {
          // Only hide splash if loading is also complete
          if (!isLoading) {
            setShowSplash(false);
          }
        }} 
      />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* First time user - show onboarding */}
      {!hasOpened && <Stack.Screen name="onboarding" />}
      
      {/* Has seen onboarding but not authenticated - show auth screens */}
      {hasOpened && !isAuthenticated && <Stack.Screen name="(auth)" />}
      
      {/* Authenticated - show main tabs */}
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
    </AuthProvider>
  );
}