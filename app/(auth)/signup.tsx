import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ChevronDown } from 'lucide-react-native';
import Constants from 'expo-constants';
import { theme } from '@/theme';
import { AnimatedInput } from '@/components/animated/AnimatedInput';
import { AnimatedButton } from '@/components/animated/AnimatedButton';

const ROLES = [
  { label: 'Master Distributor', value: 'master_distributor' },
  { label: 'Distributor', value: 'distributor' },
  { label: 'Retailer', value: 'retailer' },
];

export default function SignupScreen() {
  const router = useRouter();
  
  const [role, setRole] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tenantData = Constants.expoConfig?.extra?.tenantData;
  const domainName = tenantData?.domain || "laxmeepay.com";

  const handleSignup = async () => {
    setError('');

    if (!role || !fullName || !email || !phone || !password) {
      setError('Please fill all fields');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://api.pinepe.in/api/register", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'domain': domainName,
        },
        body: JSON.stringify({
          name: fullName,
          email: email,
          phone: phone,
          role: role,
          password: password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const json = await response.json();
      console.log(json)
      if (json.success) {
        // Redirect to OTP screen
        router.replace({
            pathname: '/(auth)/otp',
            params: { 
              otp_sent_to: email, // Matches the key expected in OTPScreen
              from: 'signup'      // Tells OTPScreen which API to use
            }
        });
      } else {
          setError(json.message || 'Signup failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { alignSelf: 'center' }]}>
          <Text style={styles.title}>Create an account</Text>
          <Text style={[styles.subtitle, { textAlign: 'center' }]}>Join our platform today.</Text>
        </View>

        <View style={styles.form}>
          <Pressable 
            style={styles.dropdownTrigger} 
            onPress={() => setShowTypeDropdown(!showTypeDropdown)}
          >
            <Text style={[styles.dropdownText, !role && { color: theme.colors.text.secondary }]}>
              {ROLES.find(r => r.value === role)?.label || 'Select type'}
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

          <AnimatedInput 
            label="Full Name" 
            value={fullName} 
            onChangeText={setFullName} 
          />

          <AnimatedInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <AnimatedInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {/* Password Field */}
          <View style={styles.inputWrapper}>
            <AnimatedInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={{ paddingRight: 50 }}
            />
            <Pressable style={styles.eyeIconContainer} onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color={theme.colors.text.secondary} />
              ) : (
                <Eye size={20} color={theme.colors.text.secondary} />
              )}
            </Pressable>
          </View>

          {/* Confirm Password Field */}
          <View style={styles.inputWrapper}>
            <AnimatedInput
              label="Confirm Password"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              secureTextEntry={!showConfirmPassword}
              style={{ paddingRight: 50 }}
            />
            <Pressable style={styles.eyeIconContainer} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? (
                <EyeOff size={20} color={theme.colors.text.secondary} />
              ) : (
                <Eye size={20} color={theme.colors.text.secondary} />
              )}
            </Pressable>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <AnimatedButton
            title="Get started"
            onPress={handleSignup}
            variant="primary"
            size="large"
            loading={loading}
            style={styles.signupButton}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.light },
  scrollContent: { paddingHorizontal: theme.spacing[6], paddingTop: theme.spacing[12], paddingBottom: theme.spacing[10] },
  header: { marginBottom: theme.spacing[8] },
  title: { fontSize: theme.typography.fontSizes['3xl'], fontWeight: theme.typography.fontWeights.bold, color: theme.colors.text.primary },
  subtitle: { fontSize: theme.typography.fontSizes.md, color: theme.colors.text.secondary, marginTop: 4 },
  form: { flex: 1 },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#fff',
    marginBottom: theme.spacing[4],
  },
  dropdownText: { fontSize: theme.typography.fontSizes.md, color: theme.colors.text.primary },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[4],
    zIndex: 1000,
    overflow: 'hidden',
  },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border.light },
  dropdownItemText: { fontSize: theme.typography.fontSizes.md, color: theme.colors.text.primary },
  inputWrapper: {
    position: 'relative',
    width: '100%',
    marginBottom: theme.spacing[4],
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  errorText: { color: theme.colors.error[500], fontSize: theme.typography.fontSizes.sm, marginBottom: theme.spacing[4] },
  signupButton: { width: '100%', marginTop: theme.spacing[2], marginBottom: theme.spacing[6] },
  loginContainer: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: theme.colors.text.secondary },
  loginLink: { color: theme.colors.primary[500], fontWeight: theme.typography.fontWeights.semibold },
});