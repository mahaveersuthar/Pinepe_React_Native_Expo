import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Clock } from 'lucide-react-native';
import { theme } from "@/theme";

const ComingSoon = () => {
  // Animation value for the dots
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceAnim]);

  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}>
      {/* Icon Circle */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Clock size={32} color={theme.colors.primary[500]} strokeWidth={2.5} />
        </View>
      </View>

      {/* Text Content */}
      <Text style={styles.title}>Coming Soon</Text>
      <Text style={styles.subtitle}>
        We are currently working hard to bring this service to life. Stay tuned for updates!
      </Text>

      {/* Animated Dots */}
      <View style={styles.dotContainer}>
        <Animated.View style={[styles.dot, { transform: [{ translateY: bounceAnim }] }]} />
        <Animated.View style={[styles.dot, styles.dotDelay1, { transform: [{ translateY: bounceAnim }] }]} />
        <Animated.View style={[styles.dot, styles.dotDelay2, { transform: [{ translateY: bounceAnim }] }]} />
      </View>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc', // slate-50
    borderWidth: 2,
    borderColor: '#e2e8f0', // slate-200
    borderStyle: 'dashed',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    minHeight: 300,
  },
  iconContainer: {
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 50,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b', // slate-800
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b', // slate-500
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  dotContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6', // blue-500
  },
  dotDelay1: {
    backgroundColor: '#60a5fa', // blue-400
    opacity: 0.7,
  },
  dotDelay2: {
    backgroundColor: '#93c5fd', // blue-300
    opacity: 0.5,
  },
});

export default ComingSoon;