import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import { theme } from '@/theme';
import { AnimatedInput } from '@/components/animated/AnimatedInput';
import { AnimatedButton } from '@/components/animated/AnimatedButton';
import Constants from 'expo-constants';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { login, otp } = useLocalSearchParams<{ login: string; otp: string }>();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const tenantData = Constants.expoConfig?.extra?.tenantData;
    const domainName = tenantData?.domain || "laxmeepay.com";

    const handleResetPassword = async () => {
        setError('');

        if (!password || !confirmPassword) {
            setError('Please fill all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            console.log("--- DEBUG START ---");
            console.log({
                otpValue: otp,
                loginValue: login,
                passValue: password,
                confirmValue: confirmPassword,
                domain:domainName
            });
            console.log("--- DEBUG END ---");
            const response = await fetch("https://api.pinepe.in/api/reset-password", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Domain': domainName,
                },
                body: JSON.stringify({
                    login: login,
                    otp: otp,
                    new_password: password, // Matches your API
                    new_password_confirmation: confirmPassword, // Matches your API
                }),
            });

            const json = await response.json();
            console.log(json)

            if (json.success) {
                // Successfully reset, take back to login
                router.replace('/(auth)/login');
            } else {
                setError(json.message || 'Reset failed. Please try again.');
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
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <Lock size={32} color={theme.colors.primary[500]} fill={`${theme.colors.primary[500]}20`} />
                    </View>
                    <Text style={styles.title}>Set New Password</Text>
                    <Text style={styles.subtitle}>
                        Create a strong, unique password for your account.
                    </Text>
                </View>

                {/* Card Section */}
                <View style={styles.formCard}>
                    {/* New Password */}
                    <View style={styles.inputWrapper}>
                        <AnimatedInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            style={{ paddingRight: 50 }}
                        />
                        <Pressable
                            style={styles.eyeIconContainer}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff size={20} color={theme.colors.text.secondary} />
                            ) : (
                                <Eye size={20} color={theme.colors.text.secondary} />
                            )}
                        </Pressable>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputWrapper}>
                        <AnimatedInput
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            style={{ paddingRight: 50 }}
                        />
                        <Pressable
                            style={styles.eyeIconContainer}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeOff size={20} color={theme.colors.text.secondary} />
                            ) : (
                                <Eye size={20} color={theme.colors.text.secondary} />
                            )}
                        </Pressable>
                    </View>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>error:</Text>
                            <Text style={styles.errorMessage}>{error}</Text>
                        </View>
                    ) : null}

                    <AnimatedButton
                        title="Reset Password"
                        onPress={handleResetPassword}
                        variant="primary"
                        size="large"
                        loading={loading}
                        style={styles.resetButton}
                    />
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
        paddingTop: theme.spacing[16],
        paddingBottom: theme.spacing[8],
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing[10],
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${theme.colors.primary[500]}10`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing[4],
        borderWidth: 1,
        borderColor: `${theme.colors.primary[500]}30`,
    },
    title: {
        fontSize: theme.typography.fontSizes['3xl'],
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[2],
    },
    subtitle: {
        fontSize: theme.typography.fontSizes.md,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing[6],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    inputWrapper: {
        position: 'relative',
        marginBottom: theme.spacing[4], // Increased spacing for better touch targets
    },
    eyeIconContainer: {
        position: 'absolute',
        right: 15,
        top: 15,
        bottom: 15,
    },
    errorContainer: {
        marginTop: theme.spacing[2],
        marginBottom: theme.spacing[4],
    },
    errorText: {
        fontSize: theme.typography.fontSizes.sm,
        fontWeight: '700',
        color: theme.colors.error[500],
    },
    errorMessage: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.text.secondary,
    },
    resetButton: {
        marginTop: theme.spacing[4],
        borderRadius: 30,
        backgroundColor: theme.colors.primary[500],
    },
});