import React, { createContext, useContext, useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native'; // Import View
import Constants from 'expo-constants';

// 1. Create the Context to hold the logo
const BrandingContext = createContext<{ logoUrl: string | null; loading: boolean }>({ 
  logoUrl: null, 
  loading: true 
});

// 2. Export a custom hook so screens can easily use the logo
export const useBranding = () => useContext(BrandingContext);

export default function AuthLayout() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Get dynamic domain from app.config.js
  const tenantData = Constants.expoConfig?.extra?.tenantData;
  const domainName = tenantData?.domain || "laxmeepay.com";

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await fetch("https://api.pinepe.in/api/whitelabel/theme", {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'domain': domainName,
          },
        });

        const json = await response.json();

        if (json.success && json.data?.theme?.mobile_logo) {
          setLogoUrl(json.data.theme.mobile_logo);
        }
      } catch (error) {
        console.error("Branding fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, []);

  return (
    
    
       <BrandingContext.Provider value={{ logoUrl, loading }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="otp" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgotpassword"/>
          <Stack.Screen name="resetpassword"/>
        </Stack>
      </BrandingContext.Provider>
     
   
  );
}