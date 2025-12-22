import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Dimensions,
  StatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { theme } from '@/theme';
import { AnimatedButton } from '@/components/animated/AnimatedButton';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');
const OTP_LENGTH = 4;

export default function OTPScreen() {
  const router = useRouter();
  const { otp_sent_to, from } = useLocalSearchParams<{ 
    otp_sent_to: string; 
    from: string; 
  }>();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRefs = useRef<TextInput[]>([]);
  const shakeAnimation = useSharedValue(0);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const triggerShake = () => {
    shakeAnimation.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  // --- API: RESEND OTP (Requires Authorization, No Domain) ---
  const handleResend = async () => {
    if (!canResend || resending) return;

    setResending(true);
    setError('');
    setIsSuccess(false);

    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      const response = await fetch("https://api.pinepe.in/api/resend-otp", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Authorization Required
        },
        body: JSON.stringify({
          type: "login",
          login: otp_sent_to,
        }),
      });

      const json = await response.json();
      console.log(json)

      if (json.success) {
        setTimer(60);
        setCanResend(false);
        setOtp(Array(OTP_LENGTH).fill(''));
        setIsSuccess(true);
        setError('OTP resent successfully!');
        setTimeout(() => {
            setIsSuccess(false);
            setError('');
        }, 3000);
      } else {
        setError(json.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // --- API: VERIFY OTP ---
  const handleVerify = async () => {
    const otpValue = otp.join('');
    setError('');
    setIsSuccess(false);

    if (otpValue.length !== OTP_LENGTH) {
      triggerShake();
      setError('Please enter all 4 digits');
      return;
    }

    setLoading(true);

    try {
      const endpoint = (from === 'login' || from === 'signup') 
        ? "https://api.pinepe.in/api/verify-otp-login" 
        : "https://api.pinepe.in/api/verify-otp";

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: otp_sent_to, 
          otp: otpValue
        }),
      });

      const json = await response.json();

      if (json.success) {
        if (from === 'login' || from === 'signup') {
          if (json.data?.access_token) {
            await SecureStore.setItemAsync('userToken', json.data.access_token);
          }
          if (json.data?.user) {
            await SecureStore.setItemAsync('userData', JSON.stringify(json.data.user));
          }
          router.replace('/(tabs)');
        } else {
          router.replace({
            pathname: '/(auth)/resetpassword',
            params: { login: otp_sent_to, otp: otpValue }
          });
        }
      } else {
        setError(json.message || 'Invalid OTP');
        triggerShake();
      }
    } catch (err) {
      setError('Network error. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }],
  }));

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 4-digit code sent to{"\n"}
            <Text style={styles.boldText}>{otp_sent_to || 'your details'}</Text>
          </Text>
        </View>

        <Animated.View style={[styles.otpContainer, animatedStyle]}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { if (ref) inputRefs.current[index] = ref; }}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </Animated.View>

        <View style={styles.timerContainer}>
          {error ? (
            <Text style={[styles.statusText, isSuccess ? styles.successText : styles.errorText]}>
              {error}
            </Text>
          ) : null}

          {canResend ? (
            <Pressable onPress={handleResend} disabled={resending}>
              <Text style={[styles.resendText, resending && { opacity: 0.5 }]}>
                {resending ? 'Sending...' : 'Resend OTP'}
              </Text>
            </Pressable>
          ) : (
            <Text style={styles.timerText}>Resend in {timer}s</Text>
          )}
        </View>

        <AnimatedButton
          title="Verify"
          onPress={handleVerify}
          variant="primary"
          size="large"
          loading={loading}
          style={styles.verifyButton}
        />

        <Pressable onPress={() => router.back()}>
          <Text style={styles.editText}>Edit Details</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[12],
    paddingBottom: theme.spacing[8],
    justifyContent: 'center',
    minHeight: WINDOW_HEIGHT - (StatusBar.currentHeight || 0),
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing[10],
  },
  title: {
    fontSize: theme.typography.fontSizes['4xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  boldText: { fontWeight: '600', color: theme.colors.text.primary },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: theme.spacing[8],
  },
  otpInput: {
    width: 60,
    height: 64,
    borderWidth: 2,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSizes['3xl'],
    fontWeight: theme.typography.fontWeights.bold,
    textAlign: 'center',
    color: theme.colors.text.primary,
    backgroundColor: '#fff',
  },
  otpInputFilled: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
    minHeight: 50,
  },
  statusText: {
    marginBottom: 12,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: { color: theme.colors.error[500] },
  successText: { color: theme.colors.primary[500] },
  resendText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeights.semibold,
  },
  timerText: { 
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary 
  },
  verifyButton: { width: '100%', marginBottom: theme.spacing[6] },
  editText: { 
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary, 
    textAlign: 'center',
  },
});