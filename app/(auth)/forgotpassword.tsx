import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Constants from 'expo-constants';
import { theme } from '@/theme';
import { AnimatedInput } from '@/components/animated/AnimatedInput';
import { AnimatedButton } from '@/components/animated/AnimatedButton';
import { BrandedLogo } from '@/components/ui/BrandLogo';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tenantData = Constants.expoConfig?.extra?.tenantData;
  const domainName = tenantData?.domain || "laxmeepay.com";

  const handleSubmit = async () => {
    setError('');
    if (!identifier.trim()) {
      setError('Please enter your Email or Username');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://api.pinepe.in/api/forgot-password", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'domain': domainName,
        },
        body: JSON.stringify({ login: identifier }),
      });

      const json = await response.json();

      if (json.success) {
        Alert.alert(
          "OTP Sent",
          json.message || "Instructions have been sent to your registered email.",
          [{
            text: "OK",
            onPress: () => router.push({
              pathname: '/(auth)/otp',
              params: { otp_sent_to: identifier, from: 'forgotpassword' }
            })
          }]
        );
      } else {
        setError(json.message || 'We could not find an account with that information.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{flex:1,backgroundColor:'white'}}>
      <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Back Button positioned absolutely to stay at top */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color={theme.colors.text.primary} />
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BrandedLogo size={140} style={styles.logo} />

        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            No worries, we'll send you reset instructions.
          </Text>
        </View>

        <View style={styles.form}>
          <AnimatedInput
            label="Email / Username"
            value={identifier}
            onChangeText={(text) => {
              setIdentifier(text);
              setError('');
            }}
            autoCapitalize="none"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <AnimatedButton
            title="Submit"
            onPress={handleSubmit}
            variant="primary"
            size="large"
            loading={loading}
            style={styles.submitButton}
          />

          <Pressable style={styles.backToLogin} onPress={() => router.back()}>
            <Text style={styles.backToLoginText}>Back to log in</Text>
          </Pressable>
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
    flexGrow: 1,
    justifyContent: 'center', // Centers logo, header, and form vertically
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[8],
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40, // Adjust for status bar
    left: theme.spacing[6],
    width: 40,
    height: 40,
    justifyContent: 'center',
    zIndex: 10,
  },
  logo: {
    marginBottom: theme.spacing[4],
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
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing[4],
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  errorText: {
    color: theme.colors.error[500],
    fontSize: theme.typography.fontSizes.sm,
    marginBottom: theme.spacing[4],
  },
  submitButton: {
    width: '100%',
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[6],
  },
  backToLogin: {
    paddingVertical: theme.spacing[2],
  },
  backToLoginText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeights.semibold,
    textAlign: 'center',
  },
});