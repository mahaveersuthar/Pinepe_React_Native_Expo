import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { User as UserIcon, Settings, Lock, Bell, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { theme } from '@/theme';
import { AnimatedCard } from '@/components/animated/AnimatedCard';
import { useAuth } from '@/context/AuthContext';
import { MPINModal } from '@/components/ui/MPINModal';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

interface MenuItem {
  icon: any;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, hasMPIN, setMPIN } = useAuth();
  const [showMPINModal, setShowMPINModal] = useState(false);
  const [mpinExists, setMpinExists] = useState(false);

  // Domain configuration
  const tenantData = Constants.expoConfig?.extra?.tenantData;
  const domainName = tenantData?.domain || "laxmeepay.com";

  React.useEffect(() => {
    checkMPIN();
  }, []);

  const checkMPIN = async () => {
    const exists = await hasMPIN();
    setMpinExists(exists);
  };

  const handleSetupMPIN = () => {
    setShowMPINModal(true);
  };

  const handleMPINSetup = async () => {
    setShowMPINModal(false);
    Alert.alert('Success', 'MPIN has been set up successfully');
    await checkMPIN();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Get the token for the Authorization header
              const token = await SecureStore.getItemAsync('userToken');

              // 2. Call the Logout API
              // We don't necessarily need to wait for a "success" to clear local data,
              // but we should attempt the call to invalidate the token on the server.
              await fetch("https://api.pinepe.in/api/logout", {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'domain': domainName,
                },
              });
            } catch (error) {
              console.error("Logout API Error:", error);
            } finally {
              // 3. Clear storage regardless of API success (user must be logged out locally)
              await SecureStore.deleteItemAsync('userToken');
              await SecureStore.deleteItemAsync('userData');

              // 4. Update Auth Context state (if you have one)
              if (signOut) {
                await signOut();
              }

              // 5. Redirect to login
              router.replace('/(auth)/login');
            }
          },
        },
      ]
    );
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Account',
      items: [
        {
          icon: UserIcon,
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          onPress: () => {},
          showChevron: true,
        },
        {
          icon: Lock,
          title: mpinExists ? 'Change MPIN' : 'Setup MPIN',
          subtitle: mpinExists ? 'Update your security PIN' : 'Set up your 4-digit security PIN',
          onPress: handleSetupMPIN,
          showChevron: true,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          title: 'Notifications',
          subtitle: 'Manage notification settings',
          onPress: () => {},
          showChevron: true,
        },
        {
          icon: Settings,
          title: 'Settings',
          subtitle: 'App preferences and configuration',
          onPress: () => {},
          showChevron: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          title: 'Help & Support',
          subtitle: 'Get help with your account',
          onPress: () => {},
          showChevron: true,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <AnimatedCard style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileInitial}>
              {user?.full_name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.full_name}</Text>
            <Text style={styles.profileEmail}>
              {user?.email || user?.phone || user?.username}
            </Text>
          </View>
        </AnimatedCard>

        {menuSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <AnimatedCard style={styles.menuCard} delay={sectionIndex * 100}>
              {section.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Pressable
                    key={item.title}
                    style={[
                      styles.menuItem,
                      index !== section.items.length - 1 && styles.menuItemBorder
                    ]}
                    onPress={item.onPress}
                  >
                    <View style={styles.menuIconContainer}>
                      <Icon size={20} color={theme.colors.primary[500]} />
                    </View>
                    <View style={styles.menuContent}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      {item.subtitle && (
                        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                      )}
                    </View>
                    {item.showChevron && (
                      <ChevronRight size={20} color={theme.colors.text.tertiary} />
                    )}
                  </Pressable>
                );
              })}
            </AnimatedCard>
          </View>
        ))}

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={theme.colors.error[500]} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>

      <MPINModal
        visible={showMPINModal}
        onSuccess={handleMPINSetup}
        onCancel={() => setShowMPINModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.dark,
  },
  header: {
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[12],
    paddingBottom: theme.spacing[4],
  },
  title: {
    fontSize: theme.typography.fontSizes['3xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[6],
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  profileImageContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[4],
  },
  profileInitial: {
    fontSize: theme.typography.fontSizes['3xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.inverse,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  profileEmail: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary,
  },
  section: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[3],
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  menuSubtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.secondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.error[50],
    marginBottom: theme.spacing[6],
  },
  logoutText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.error[500],
    marginLeft: theme.spacing[2],
  },
});
