// components/BrandedLogo.tsx
import React, { useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useBranding } from '../../app/(auth)/_layout'
import { theme } from '@/theme';

interface BrandedLogoProps {
  size?: number;
  style?: ViewStyle;
}

export const BrandedLogo = ({ size = 120, style }: BrandedLogoProps) => {
  const { logoUrl, loading: brandingLoading } = useBranding();
  const [imageLoading, setImageLoading] = useState(true);

  // If the layout is still fetching the URL
  if (brandingLoading) {
    return (
      <View style={[styles.container, { height: size }, style]}>
        <ActivityIndicator size="small" color={theme.colors.primary[500]} />
      </View>
    );
  }

  // If no logo was found after fetching
  if (!logoUrl) return null;

  return (
    <View style={[styles.container, { height: size }, style]}>
      <Image
        source={{ uri: logoUrl }}
        style={styles.image}
        resizeMode="contain"
        onLoadEnd={() => setImageLoading(false)}
      />
      {imageLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="small" color={theme.colors.primary[500]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});