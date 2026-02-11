import { router, Tabs } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { Home, User, Receipt, Grid, ShieldAlert, RefreshCcw } from 'lucide-react-native';
import { theme } from '@/theme';
import { useEffect, useState } from 'react';
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { useBranding } from '@/context/BrandingContext';
import { getLatLong } from '@/utils/location';
import { getKycStatusApi } from '../../api/kyc.api';
import * as Linking from 'expo-linking';
import { useAuth } from '@/context/AuthContext';
import * as Application from 'expo-application';
import { logoutApi } from '@/api/auth.api';
import KYCApplicationForm from '../KYCApplicationForm';

export default function TabLayout() {
  type KycStatus = "NOT_SUBMITTED" | "PENDING" | "APPROVED";

const [kycStatus, setKycStatus] = useState<KycStatus>("NOT_SUBMITTED");
const [kycLoading, setKycLoading] = useState(true);
  const appName = (Application.applicationName || '').toString().trim();
    const { domainName: brandingDomain, tenant } = useBranding();
    const domainName = brandingDomain !;

   
  const generateLoginUrl = (domain?: string | null): string => {
  if (!domain) return "";

  // Remove protocol if accidentally passed
  const cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  return `https://${cleanDomain}/login`;
};

 
  const { signOut, hasMPIN } = useAuth();

   const handleLogout = () => {
  Alert.alert("Logout", "Are you sure you want to logout?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Logout",
      style: "destructive",
      onPress: async () => {
        try {
         

          const location = await getLatLong();
          const token = await SecureStore.getItemAsync("userToken");

          // Call API only if we have required data
          if (location && token) {
            try {
              await logoutApi({
                latitude: location.latitude,
                longitude: location.longitude,
                token,
              });
            } catch (apiErr) {
              // Silent fail – we still logout locally
              console.log("Logout API failed, proceeding locally");
            }
          }
        } catch (err) {
          console.log("Logout error:", err);
        } finally {
          // 🔐 FORCE LOGOUT LOCALLY (Always runs)
          await SecureStore.deleteItemAsync("userToken");
          await SecureStore.deleteItemAsync("userData");

          await signOut();
          router.replace("/(auth)/login");

         
        }
      },
    },
  ]);
};


  const checkKycStatus = async () => {
  try {
    setKycLoading(true);

    const location = await getLatLong();
    const token = await SecureStore.getItemAsync("userToken");
    if (!token) return;

    const res = await getKycStatusApi({
      latitude: location?.latitude?.toString() || "0",
      longitude: location?.longitude?.toString() || "0",
      token,
    });

    // 🔥 EXACT BACKEND MAPPING
    if (res.success === false) {
      // "KYC not submitted yet"
      setKycStatus("NOT_SUBMITTED");
      return;
    }

    if (res.success === true) {
      if (res.data?.kyc_status === "Approved") {
        setKycStatus("APPROVED");
      } else if (res.data?.kyc_status === "Pending") {
        setKycStatus("PENDING");
      } else {
        setKycStatus("NOT_SUBMITTED");
      }
    }
  } catch (err) {
    console.error("KYC Check Error:", err);
    setKycStatus("NOT_SUBMITTED");
  } finally {
    setKycLoading(false);
  }
};


  useEffect(() => {
    checkKycStatus();
  }, []);


  if (kycLoading) {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={theme.colors.primary[500]} />
    </View>
  );
}

/* ❌ KYC NOT SUBMITTED → SHOW FORM */
if (kycStatus === "NOT_SUBMITTED") {
  return (
    <KYCApplicationForm
      
    />
  );
}

/* ⏳ PENDING → SHOW PENDING VIEW */
if (kycStatus === "PENDING") {
  return (
    <View style={styles.centered}>
      <ShieldAlert size={48} color={theme.colors.primary[500]} />
      <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 16 }}>
        KYC Under Review
      </Text>
      <Text style={{ marginTop: 8, color: "#666" }}>
        Your KYC is under verification.
      </Text>

      <TouchableOpacity
        style={{ marginTop: 20 }}
        onPress={checkKycStatus}
      >
        <RefreshCcw  size={16} color={theme.colors.primary[500]} />
        <Text style={{ color: theme.colors.primary[500], marginTop: 6 }}>
          Refresh Status
        </Text>
      </TouchableOpacity>
    </View>
  );
}
  






  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.iconContainer}>
              <Home size={size} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.iconContainer}>
              <Receipt size={size} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.iconContainer}>
              <Grid size={size} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.iconContainer}>
              <User size={size} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: theme.spacing[5],
    left: theme.spacing[5],
    right: theme.spacing[5],
    backgroundColor: theme.colors.background.light,
    borderRadius: theme.borderRadius.xl,
    height: 70,
    paddingBottom: theme.spacing[2],
    paddingTop: theme.spacing[2],
    ...theme.shadows.xl,
  },
  tabBarLabel: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.medium,
  },
  tabBarItem: {
    paddingVertical: theme.spacing[1],
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light,
  },
  kycContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
    justifyContent: 'center',
    padding: theme.spacing[5],
  },
  kycCard: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 20,
    padding: theme.spacing[6],
    alignItems: 'center',
    ...theme.shadows.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.primary[500]}15`, // 15% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  kycTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  kycSubtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing[2],
    lineHeight: 20,
    marginBottom: theme.spacing[6],
  },
  primaryButton: {
    backgroundColor: theme.colors.primary[500],
    width: '100%',
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: theme.typography.fontWeights.bold,
    fontSize: theme.typography.fontSizes.md,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing[4],
    padding: theme.spacing[2],
  },
  secondaryButtonText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSizes.sm,
  },

});
