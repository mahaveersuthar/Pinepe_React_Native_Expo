import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import Constants from 'expo-constants';
import { theme } from '@/theme';
import { AnimatedInput } from '@/components/animated/AnimatedInput';
import { AnimatedButton } from '@/components/animated/AnimatedButton';
import { useAuth } from '@/context/AuthContext';
import { BrandedLogo } from '@/components/ui/BrandLogo';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  
  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get dynamic domain from app.config.js
  const tenantData = Constants.expoConfig?.extra?.tenantData;
  const domainName = tenantData?.domain || "laxmeepay.com";



  
  const handleLogin = async () => {
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please enter your credentials');
      return;
    }

    setLoading(true);
    console.log("Domain name : ",domainName);
    console.log("Identifier: ",identifier);
    console.log("Password : ",password);

    try {
      const response = await fetch("https://api.pinepe.in/api/login", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'domain': domainName, 
        },
        body: JSON.stringify({
          login: identifier,
          password: password,
        }),
      });

      const json = await response.json();

      if (json.success) {
        router.push({
          pathname: '/(auth)/otp',
          params: { 
            otp_sent_to: json.data.otp_sent_to,
            from: 'login' 
          }
        });
      } else {
        setError(json.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
   <View style={{backgroundColor:'white',flex:1}}>
       <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container,]}
    >
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BrandedLogo size={150} style={{ marginBottom: 5 }} />

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

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  scrollContent: {
    flexGrow: 1, // Allows the container to expand to full screen height
    justifyContent: 'center', // Centers children vertically
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[8],
  },
  logoWrapper: {
    width: 250,
    height: 120, // Reduced height slightly for better vertical balance
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: '100%', // Changed from flex: 1 to width 100%
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