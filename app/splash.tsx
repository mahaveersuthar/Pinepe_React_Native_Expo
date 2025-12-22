import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Wallet } from "lucide-react-native";
import { theme } from "@/theme";

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );

    opacity.value = withTiming(1, { duration: 800 });

    // Call onComplete after 3 seconds if provided
    if (onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <LinearGradient
      colors={[
        theme.colors.primary[400],
        theme.colors.primary[600],
        theme.colors.primary[800],
      ]}
      style={styles.container}
    >
      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.iconContainer}>
          <Wallet
            size={80}
            color={theme.colors.text.inverse}
            strokeWidth={2}
          />
        </View>
        <Text style={styles.title}>PayFlow</Text>
        <Text style={styles.subtitle}>Your Digital Wallet</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: theme.spacing[6],
  },
  title: {
    fontSize: theme.typography.fontSizes["5xl"],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text.inverse,
    opacity: 0.9,
  },
});