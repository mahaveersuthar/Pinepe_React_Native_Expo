import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Linking,
} from "react-native";
import { Search } from "lucide-react-native";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";

import { theme } from "@/theme";
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { getLatLong } from "@/utils/location";
import { getServicesApi } from "../api/service.api";

type ServiceItem = {
  id: number;
  name: string;
  slug: string;
  image: string;
  url: string;
  status: number;
  category: string;
  is_purchased: boolean;
  amount: number | null;
  is_locked: boolean;
};

export default function ServicesScreen() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);

  const tenantData = Constants.expoConfig?.extra?.tenantData;
  const domainName = tenantData?.domain || "laxmeepay.com";

  /* ===========================
     FETCH SERVICES
  ============================ */
  const handleFetchServices = async () => {
    setLoading(true);

    try {
      const location = await getLatLong();
      if (!location) {
        Toast.show({
          type: "error",
          text1: "Location Required",
          text2: "Please enable location permission",
        });
        return;
      }

      const token = await SecureStore.getItemAsync("userToken");

      const json = await getServicesApi({
        domain: domainName,
        latitude: location.latitude,
        longitude: location.longitude,
        token: token!,
        status: "active",
        perPage: 50,
      });

      setServices(json.data.items);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to load services",
        text2: err.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchServices();
  }, []);

  /* ===========================
     GROUP + SORT (A → Z)
  ============================ */
  const groupedServices = useMemo(() => {
    const map: Record<string, ServiceItem[]> = {};

    services.forEach(service => {
      const category = service.category || "Others";
      if (!map[category]) map[category] = [];
      map[category].push(service);
    });

    Object.keys(map).forEach(category => {
      map[category].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    });

    return Object.keys(map)
      .sort((a, b) => a.localeCompare(b))
      .map(category => ({
        category,
        items: map[category],
      }));
  }, [services]);

  /* ===========================
     SERVICE ACTION
  ============================ */
  const handleServicePress = (service: ServiceItem) => {
    if (service.url.startsWith("/")) {
      console.log("Navigate internal:", service.url);
    } else {
      Linking.openURL(service.url);
    }
  };

  /* ===========================
     UI
  ============================ */
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <Pressable style={styles.searchButton}>
          <Search size={20} color={theme.colors.text.primary} />
        </Pressable>
      </View>

      {/* CONTENT */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {groupedServices.map(({ category, items }) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>
              {category.toUpperCase()}
            </Text>

            <View style={styles.servicesGrid}>
              {items.map((service, index) => (
                <AnimatedCard
                  key={service.id}
                  style={styles.serviceCard}
                  delay={index * 60}
                >
                  {/* ICON */}
                  <View style={styles.iconWrapper}>
                    <Image
                      source={{ uri: service.image }}
                      style={styles.serviceImage}
                      resizeMode="contain"
                    />
                  </View>

                  {/* INFO */}
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName} numberOfLines={2}>
                      {service.name}
                    </Text>

                    <Text style={styles.serviceCategory}>
                      {service.category}
                    </Text>

                    <View style={styles.footerRow}>
                      <Text style={styles.amountText}>
                        ₹{service.amount ?? "0"}
                      </Text>

                      <AnimatedButton
                        title="Purchase Now"
                        onPress={() => handleServicePress(service)}
                        variant="primary"
                        size="small"
                        loading={loading}
                      />
                    </View>
                  </View>
                </AnimatedCard>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

/* ===========================
   STYLES
=========================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.dark,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[12],
    paddingBottom: theme.spacing[4],
  },
  title: {
    fontSize: theme.typography.fontSizes["3xl"],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.primary,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.light,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[6],
  },
  categorySection: {
    marginBottom: theme.spacing[6],
  },
  categoryTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: "700",
    color: theme.colors.primary[500],
    marginBottom: theme.spacing[3],
    letterSpacing: 1.2,
  },
  servicesGrid: {
    gap: theme.spacing[4],
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background.light,
    paddingVertical: theme.spacing[3],
    ...theme.shadows.md,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    marginLeft: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.dark,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceImage: {
    width: 55,
    height: 55,
  },
  serviceInfo: {
    flex: 1,
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[1],
  },
  serviceName: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.primary,
  },
  serviceCategory: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.text.secondary,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing[2],
  },
  amountText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary[500],
  },
});
