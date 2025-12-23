import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';
import { theme } from '@/theme';
import { AnimatedInput } from '@/components/animated/AnimatedInput';
import { AnimatedButton } from '@/components/animated/AnimatedButton';
import { BrandedLogo } from '@/components/ui/BrandLogo';
import * as Location from "expo-location";


const getLatLong = async () => {
  try {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.log("Location error:", error);
    return null;
  }
};


export default function LoginScreen() {
  const router = useRouter();

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tenantData = Constants.expoConfig?.extra?.tenantData;
  const domainName = tenantData?.domain || "laxmeepay.com";
  const handleLogin = async () => {
    setError('');

    if (!identifier.trim() || !password) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter both identifier and password',
      });
      return;
    }

    setLoading(true);

    try {
      // 📍 Get location
      const location = await getLatLong();

      // ❌ Block login if location is missing
      if (!location?.latitude || !location?.longitude) {
        Toast.show({
          type: 'error',
          text1: 'Location Required',
          text2: 'Please enable location permission to continue',
        });

        setLoading(false);
        return;
      }

      const response = await fetch("https://api.pinepe.in/api/login", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          domain: domainName,

          // ✅ PASS LAT/LONG IN HEADERS
          latitude: String(location.latitude),
          longitude: String(location.longitude),
        },

        // ✅ ONLY AUTH DATA IN BODY
        body: JSON.stringify({
          login: identifier,
          password: password,
        }),
      });

      const json = await response.json();

      if (json.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: json.message || 'Verification code sent',
        });

        router.push({
          pathname: '/(auth)/otp',
          params: {
            otp_sent_to: json.data.otp_sent_to,
            from: 'login',
          },
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: json.message || 'Invalid credentials',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Connection Error',
        text2: 'Unable to reach server',
      });
    } finally {
      setLoading(false);
    }
  };




  return (
    <View style={styles.outerContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BrandedLogo size={150} style={styles.logo} />

          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.form}>
            <AnimatedInput
              label="Email / Phone / Username"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                setError('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View style={styles.passwordContainer}>
              <AnimatedInput
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.colors.text.secondary} />
                ) : (
                  <Eye size={20} color={theme.colors.text.secondary} />
                )}
              </Pressable>
            </View>



            <Pressable onPress={() => router.push('/(auth)/forgotpassword')}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </Pressable>

            <AnimatedButton
              title="Login"
              onPress={handleLogin}
              variant="primary"
              size="large"
              loading={loading}
              style={styles.loginButton}
            />

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[8],
  },
  logo: {
    marginBottom: 5,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  },
  title: {
    fontSize: theme.typography.fontSizes['4xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text.secondary,
  },
  form: {
    width: '100%',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: theme.spacing[12],
  },
  eyeIcon: {
    position: 'absolute',
    right: theme.spacing[4],
    top: 18,
  },
  errorText: {
    color: theme.colors.error[500],
    fontSize: theme.typography.fontSizes.sm,
    marginBottom: theme.spacing[4],
  },
  forgotPassword: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeights.semibold,
    textAlign: 'right',
    marginBottom: theme.spacing[8],
  },
  loginButton: {
    width: '100%',
    marginBottom: theme.spacing[6],
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary,
  },
  signupLink: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeights.semibold,
  },
});