import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ChevronDown } from 'lucide-react-native';
import Toast from 'react-native-toast-message'; // 1. Import Toast
import Constants from 'expo-constants';
import { useBranding } from '@/context/BrandingContext';
import { AnimatedInput } from '@/components/animated/AnimatedInput';
import { AnimatedButton } from '@/components/animated/AnimatedButton';
import { BrandedLogo } from '@/components/ui/BrandLogo';
import { registerApi } from '../../api/auth.api';
import { getLatLong } from '@/utils/location';
import { useTheme } from '@/context/ThemeProvider';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

const ROLES = [
  { label: 'Master Distributor', value: 'master_distributor' },
  { label: 'Distributor', value: 'distributor' },
  { label: 'Retailer', value: 'retailer' },
];

export default function SignupScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const [errors, setErrors] = useState<{
    role?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    passwordConfirmation?: string;
  }>({});

  // Form State
  const [role, setRole] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Domain configuration



  const addIndiaCountryCode = (phone: string): string => {
    if (!phone) return "";

    // Remove spaces and non-numeric chars
    const cleaned = phone.replace(/\D/g, "");

    // If already has country code
    if (cleaned.startsWith("91") && cleaned.length === 12) {
      return `+${cleaned}`;
    }

    // If normal 10-digit Indian number
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }

    // Fallback (return as-is with +)
    return phone.startsWith("+") ? phone : `+${cleaned}`;
  };



  const handleSignup = async () => {
    const newErrors: typeof errors = {};
    if (!role) newErrors.role = "Please select user type";
    if (!fullName) newErrors.fullName = "Full name is required";
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!passwordConfirmation)
      newErrors.passwordConfirmation = "Confirm password is required";

    if (
      password &&
      passwordConfirmation &&
      password !== passwordConfirmation
    ) {
      newErrors.passwordConfirmation = "Passwords do not match";
    }

    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({}); // clear previous errors

    setLoading(true);

    try {
      // 📍 Get location
      const location = await getLatLong();

      // ❌ Block signup if location missing
      if (!location) {
        Toast.show({
          type: "error",
          text1: "Location Required",
          text2: "Please enable location permission to continue",
        });
        setLoading(false); // Don't forget this!
        return;
      }


      const formattedPhone = addIndiaCountryCode(phone);

      const payload = {
        name: fullName,
        email: email,
        phone: formattedPhone,
        role: role,
        password: password,
        password_confirmation: passwordConfirmation,
      };

      const json = await registerApi(
        {
          name: fullName,
          email: email,
          phone: formattedPhone,
          role: role,
          password: password,
          password_confirmation: passwordConfirmation,
        },
        {

          latitude: location.latitude,
          longitude: location.longitude,
        }
      );








      Toast.show({
        type: "success",
        text1: "Account Created",
        text2: "Please verify your email to continue",
      });

      router.replace({
        pathname: "/(auth)/otp",
        params: {
          otp_sent_to: email,
          from: "signup",
        },
      });

    } catch (err: any) {


      const errors = err?.response?.data?.errors;
      let errorMessage = "Something went wrong. Please try again.";

      if (errors) {
        // Take first validation error message
        const firstKey = Object.keys(errors)[0];
        errorMessage = errors[firstKey][0];

      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      Toast.show({
        type: "error",
        text1: "Signup Failed",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <BrandedLogo size={200} style={styles.logo} />

          <View style={styles.header}>
            <Text style={styles.title}>Create an account</Text>
            <Text style={styles.subtitle}>Join our platform today.</Text>
          </View>

          <View style={styles.form}>
            {/* User Type Dropdown */}
            <View style={styles.fieldGroup}>
              <Pressable
                style={[styles.dropdownTrigger, showTypeDropdown && styles.dropdownActive]}
                onPress={() => setShowTypeDropdown(!showTypeDropdown)}
              >
                <Text style={[styles.dropdownText, !role && { color: theme.colors.text.secondary }]}>
                  {role ? ROLES.find(r => r.value === role)?.label : 'Select User Type'}
                </Text>
                <ChevronDown size={20} color={theme.colors.text.secondary} />
              </Pressable>

              {showTypeDropdown && (
                <View style={styles.dropdownMenu}>
                  {ROLES.map((item) => (
                    <Pressable
                      key={item.value}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setRole(item.value);
                        setShowTypeDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{item.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <AnimatedInput
              label="Full Name"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                setErrors((e) => ({ ...e, fullName: undefined }));
              }}
              error={errors.fullName}
            />

            <AnimatedInput
              label="Email Address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((e) => ({ ...e, email: undefined }));
              }}
              error={errors.email}
            />

            <AnimatedInput
              label="Phone Number"
              value={phone}
              keyboardType="number-pad"
              maxLength={10}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, "");
                setPhone(cleaned);

                setErrors((e) => ({
                  ...e,
                  phone:
                    cleaned.length === 0
                      ? "Phone number is required"
                      : cleaned.length < 10
                        ? "Enter a valid 10-digit phone number"
                        : undefined,
                }));
              }}
              error={errors.phone}
            />



            <View style={styles.inputWrapper}>
              <AnimatedInput
                label="Password"
                value={password}
                secureTextEntry={!showPassword}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors((e) => ({ ...e, password: undefined }));
                }}
                error={errors.password}
              />

              <Pressable style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} color={theme.colors.text.secondary} /> : <Eye size={20} color={theme.colors.text.secondary} />}
              </Pressable>
            </View>

            <View style={styles.inputWrapper}>
              <AnimatedInput
                label="Confirm Password"
                value={passwordConfirmation}
                secureTextEntry={!showConfirmPassword}
                onChangeText={(text) => {
                  setPasswordConfirmation(text);

                  setErrors((e) => ({
                    ...e,
                    passwordConfirmation:
                      password && text && text !== password
                        ? "Passwords do not match"
                        : undefined,
                  }));
                }}
                error={errors.passwordConfirmation}
              />

              <Pressable style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={20} color={theme.colors.text.secondary} /> : <Eye size={20} color={theme.colors.text.secondary} />}
              </Pressable>
            </View>

            <AnimatedButton
              title="Get started"
              onPress={handleSignup}
              loading={loading}
              variant="primary"
              size="large"
              style={styles.btn}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Pressable onPress={() => router.back()}>
                <Text style={styles.loginLink}>Log in</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 10
  },
  header: {
    marginBottom: 30,
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: 5,
    textAlign: 'center'
  },
  form: {
    width: '100%'
  },
  fieldGroup: {
    marginBottom: 16,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: 12,
    backgroundColor: theme.colors.background.surface, // ✅
  },

  dropdownActive: {
    borderColor: theme.colors.primary[500],
    borderWidth: 2,
  },

  dropdownText: {
    fontSize: 16,
    color: theme.colors.text.primary
  },
  dropdownMenu: {
    backgroundColor: theme.colors.background.surface, // ✅
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: 12,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    zIndex: 1000,
  },

  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },

  dropdownItemText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },

  inputWrapper: {
    position: 'relative',
    marginBottom: 4
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 10
  },
  btn: {
    marginTop: 10,
    marginBottom: 20,
    width: '100%'
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },
  loginText: {
    color: theme.colors.text.secondary,
    fontSize: 15
  },
  loginLink: {
    color: theme.colors.primary[500],
    fontWeight: 'bold',
    fontSize: 15
  },
});