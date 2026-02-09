import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import Constants from "expo-constants";
import { useBranding } from '@/context/BrandingContext';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { theme } from "@/theme";

interface SplashScreenProps {
  onComplete?: () => void;
}



export default function SplashScreenComponent({ onComplete }: SplashScreenProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Hide native splash immediately
    SplashScreen.hideAsync();

    scale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );

    opacity.value = withTiming(1, { duration: 800 });

    if (onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const { logoUrl } = useBranding();
  const source = { uri: logoUrl }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <Image source={source as any} style={styles.logo} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // ✅ WHITE BG
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: 300,
    height: 300,
  },
});
