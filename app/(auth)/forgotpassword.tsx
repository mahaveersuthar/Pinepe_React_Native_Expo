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
import { ArrowLeft, Mail } from 'lucide-react-native';
import Constants from 'expo-constants';
import { theme } from '@/theme';
import { AnimatedInput } from '@/components/animated/AnimatedInput';
import { AnimatedButton } from '@/components/animated/AnimatedButton';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get dynamic domain from app.config.js
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
        body: JSON.stringify({
          login: identifier // Maps to the API requirement
        }),
      });

      const json = await response.json();

      if (json.success) {
        // Success according to your API response: {"success":true,"message":"OTP sent..."}
        Alert.alert(
          "OTP Sent",
          json.message || "Instructions have been sent to your registered email.",
          [{
            text: "OK",
            onPress: () => router.push({
              pathname: '/(auth)/otp',
              params: {
                otp_sent_to: identifier,
                from: 'forgotpassword'
              }// Direct user to enter the OTP they just received
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </Pressable>

        {/* Branding Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary[50] }]}>
            <Mail size={32} color={theme.colors.primary[500]} />
          </View>
        </View>

        {/* Text Header */}
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
            autoFocus
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
    paddingTop: Platform.OS === 'ios' ? theme.spacing[12] : theme.spacing[8],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: theme.spacing[4],
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: theme.spacing[4],
    lineHeight: 22,
  },
  form: {
    flex: 1,
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
    paddingVertical: theme.spacing[4],
  },
  backToLoginText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeights.semibold,
    textAlign: 'center',
  },
});