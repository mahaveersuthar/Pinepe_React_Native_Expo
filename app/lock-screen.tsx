import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock } from 'lucide-react-native';
import { theme } from '@/theme';
import { useAuth } from '@/context/AuthContext';

const MPIN_LENGTH = 4;

export default function LockScreen() {
  const router = useRouter();
  const { verifyMPIN } = useAuth();
  const [mpin, setMpin] = useState<string[]>(Array(MPIN_LENGTH).fill(''));
  const [error, setError] = useState('');
  const shakeAnimation = useSharedValue(0);

  const handleNumberPress = (num: number) => {
    const emptyIndex = mpin.findIndex((digit) => digit === '');
    if (emptyIndex !== -1) {
      const newMpin = [...mpin];
      newMpin[emptyIndex] = num.toString();
      setMpin(newMpin);
      setError('');

      if (emptyIndex === MPIN_LENGTH - 1) {
        setTimeout(async () => {
          const mpinValue = newMpin.join('');
          const isValid = await verifyMPIN(mpinValue);

          if (isValid) {
            router.replace('/(tabs)');
          } else {
            setError('Incorrect MPIN');
            shakeAnimation.value = withSequence(
              withTiming(-10, { duration: 50 }),
              withTiming(10, { duration: 50 }),
              withTiming(-10, { duration: 50 }),
              withTiming(10, { duration: 50 }),
              withTiming(0, { duration: 50 })
            );
            setTimeout(() => {
              setMpin(Array(MPIN_LENGTH).fill(''));
            }, 500);
          }
        }, 100);
      }
    }
  };

  const handleDelete = () => {
    const lastFilledIndex = mpin.findIndex((digit) => digit === '') - 1;
    const indexToDelete = lastFilledIndex >= 0 ? lastFilledIndex : MPIN_LENGTH - 1;

    if (mpin[indexToDelete] !== '') {
      const newMpin = [...mpin];
      newMpin[indexToDelete] = '';
      setMpin(newMpin);
      setError('');
    }
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }],
  }));

  return (
    <LinearGradient
      colors={[theme.colors.primary[600], theme.colors.primary[800]]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.lockIconContainer}>
          <Lock size={48} color={theme.colors.text.inverse} />
        </View>

        <Text style={styles.title}>Enter MPIN</Text>
        <Text style={styles.subtitle}>Enter your 4-digit PIN to unlock</Text>

        <Animated.View style={[styles.mpinDisplay, shakeStyle]}>
          {mpin.map((digit, index) => (
            <View
              key={index}
              style={[styles.mpinDot, digit && styles.mpinDotFilled]}
            />
          ))}
        </Animated.View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Pressable
              key={num}
              style={styles.keypadButton}
              onPress={() => handleNumberPress(num)}
            >
              <View style={styles.keypadButtonInner}>
                <Text style={styles.keypadText}>{num}</Text>
              </View>
            </Pressable>
          ))}
          <View style={styles.keypadButton} />
          <Pressable
            style={styles.keypadButton}
            onPress={() => handleNumberPress(0)}
          >
            <View style={styles.keypadButtonInner}>
              <Text style={styles.keypadText}>0</Text>
            </View>
          </Pressable>
          <Pressable
            style={styles.keypadButton}
            onPress={handleDelete}
          >
            <View style={styles.keypadButtonInner}>
              <Text style={styles.keypadText}>⌫</Text>
            </View>
          </Pressable>
        </View>

        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.forgotText}>Forgot MPIN?</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[20],
    alignItems: 'center',
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  title: {
    fontSize: theme.typography.fontSizes['3xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.inverse,
    opacity: 0.9,
    marginBottom: theme.spacing[10],
  },
  mpinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[8],
  },
  mpinDot: {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.text.inverse,
  },
  mpinDotFilled: {
    backgroundColor: theme.colors.text.inverse,
  },
  errorText: {
    color: '#FFE0E0',
    fontSize: theme.typography.fontSizes.sm,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[6],
    width: '100%',
    maxWidth: 300,
  },
  keypadButton: {
    width: '30%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  keypadButtonInner: {
    width: '80%',
    height: '80%',
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadText: {
    fontSize: theme.typography.fontSizes['3xl'],
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text.inverse,
  },
  forgotText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
  },
});
