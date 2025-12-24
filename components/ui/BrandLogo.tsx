// components/BrandedLogo.tsx
import React from "react";
import { View, Image, StyleSheet, ViewStyle } from "react-native";
import { theme } from "@/theme";

interface BrandedLogoProps {
  size?: number;
  style?: ViewStyle;
}

const APP_ICON = require("@/assets/generated/icon.png");

export const BrandedLogo = ({
  size = 120,
  style,
}: BrandedLogoProps) => {
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
        style,
      ]}
    >
      <Image
        source={APP_ICON}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
