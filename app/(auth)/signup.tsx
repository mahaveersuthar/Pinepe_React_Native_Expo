import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ChevronDown } from 'lucide-react-native';
import Constants from 'expo-constants';
import { theme } from '@/theme';
import { AnimatedInput } from '@/components/animated/AnimatedInput';
import { AnimatedButton } from '@/components/animated/AnimatedButton';
import { BrandedLogo } from '@/components/ui/BrandLogo';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

const ROLES = [
  { label: 'Master Distributor', value: 'master_distributor' },
  { label: 'Distributor', value: 'distributor' },
  { label: 'Retailer', value: 'retailer' },
];

export default function SignupScreen() {
  const router = useRouter();
  
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
  const [error, setError] = useState('');

  // Domain configuration
  const tenantData = Constants.expoConfig?.extra?.tenantData;
  const domainName = tenantData?.domain || "laxmeepay.com";

  const handleSignup = async () => {
    setError('');

    // Basic Validation
    if (!role || !fullName || !email || !phone || !password || !passwordConfirmation) {
      setError('Please fill all fields');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }

    if (phone.length < 10) {
      setError('Please enter a valid phone number');
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

      if (json.success) {
        router.replace({
          pathname: '/(auth)/otp',
          params: { 
            otp_sent_to: email,
            from: 'signup'
          }
        });
      } else {
        setError(json.message || 'Signup failed. Please check your details.');
      }
    } catch (err) {
      setError('Connection error. Please check your internet and try again.');
      console.error("Signup Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.mainWrapper,]}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent,{}]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo Section */}
          <BrandedLogo size={120} style={styles.logo} />

          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Create an account</Text>
            <Text style={styles.subtitle}>Join our platform today.</Text>
          </View>

          {/* Form Section */}
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
              onChangeText={setFullName} 
            />

            <AnimatedInput
              label="Email Address"
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
              maxLength={10}
            />

            {/* Password Field */}
            <View style={styles.inputWrapper}>
              <AnimatedInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} color={theme.colors.text.secondary} /> : <Eye size={20} color={theme.colors.text.secondary} />}
              </Pressable>
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputWrapper}>
              <AnimatedInput
                label="Confirm Password"
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={20} color={theme.colors.text.secondary} /> : <Eye size={20} color={theme.colors.text.secondary} />}
              </Pressable>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <AnimatedButton 
              title="Get started" 
              onPress={handleSignup} 
              loading={loading} 
              variant="primary"
              size="large"
              style={styles.btn} 
            />

            {/* Login Link */}
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

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
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
  inputLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '500'
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: 12,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: theme.colors.border.medium, 
    borderRadius: 12, 
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden'
  },
  dropdownItem: { 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border.light 
  },
  dropdownItemText: { 
    fontSize: 16,
    color: theme.colors.text.primary 
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
  errorContainer: {
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEB2B2'
  },
  errorText: { 
    color: theme.colors.error[500], 
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500'
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