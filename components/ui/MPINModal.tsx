import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { theme } from '@/theme';
import { useAuth } from '@/context/AuthContext';

interface MPINModalProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const MPIN_LENGTH = 4;

export function MPINModal({ visible, onSuccess, onCancel }: MPINModalProps) {
  const { verifyMPIN } = useAuth();
  const [mpin, setMpin] = useState<string[]>(Array(MPIN_LENGTH).fill(''));
  const [error, setError] = useState('');
  const translateY = useSharedValue(500);
  const shakeAnimation = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20 });
    } else {
      translateY.value = withTiming(500);
      setMpin(Array(MPIN_LENGTH).fill(''));
      setError('');
    }
  }, [visible]);

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
            onSuccess();
            setMpin(Array(MPIN_LENGTH).fill(''));
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>Enter MPIN</Text>
            <Pressable onPress={onCancel}>
              <X size={24} color={theme.colors.text.primary} />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>Enter your 4-digit MPIN to continue</Text>

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
                <Text style={styles.keypadText}>{num}</Text>
              </Pressable>
            ))}
            <View style={styles.keypadButton} />
            <Pressable
              style={styles.keypadButton}
              onPress={() => handleNumberPress(0)}
            >
              <Text style={styles.keypadText}>0</Text>
            </Pressable>
            <Pressable
              style={styles.keypadButton}
              onPress={handleDelete}
            >
              <Text style={styles.keypadText}>⌫</Text>
            </Pressable>
          </View>

          <Pressable onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.background.light,
    borderTopLeftRadius: theme.borderRadius['2xl'],
    borderTopRightRadius: theme.borderRadius['2xl'],
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[6],
    paddingBottom: theme.spacing[10],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  title: {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[8],
  },
  mpinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[8],
  },
  mpinDot: {
    width: 16,
    height: 16,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.border.medium,
  },
  mpinDotFilled: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  errorText: {
    color: theme.colors.error[500],
    fontSize: theme.typography.fontSizes.sm,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[6],
  },
  keypadButton: {
    width: '30%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  keypadText: {
    fontSize: theme.typography.fontSizes['3xl'],
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text.primary,
  },
  cancelText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeights.semibold,
    textAlign: 'center',
  },
});
