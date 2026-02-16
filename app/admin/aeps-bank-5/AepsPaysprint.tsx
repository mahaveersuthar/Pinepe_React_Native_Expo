import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Banknote, FileText, Landmark, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router"; // or your preferred navigation
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { theme } from "@/theme";

const AepsPaysprint = () => {
  const router = useRouter();

  const services = [
    {
      title: "Balance Enquiry",
      description: "Check the real-time available balance in your linked bank account securely.",
      icon: <Landmark size={24} color={theme.colors.primary[600]} />,
      color: "#EFF6FF", // Light blue
      route: "/admin/aeps-bank-5/balance-enquiry",
    },
    {
      title: "Mini Statement",
      description: "Get a summary of your last 10 transactions instantly without visiting the bank.",
      icon: <FileText size={24} color="#9333EA" />,
      color: "#FAF5FF", // Light purple
      route: "/admin/aeps-bank-5/mini-statement",
    },
    {
      title: "Cash Withdrawal",
      description: "Withdraw cash from your bank account using Aadhaar authentication easily.",
      icon: <Banknote size={24} color="#059669" />,
      color: "#ECFDF5", // Light emerald
      route: "/admin/aeps-bank-5/cash-withdrawl",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>AEPS Services</Text>
        <Text style={styles.subtitle}>Secure Aadhaar Enabled Payment System</Text>
      </View>

      <View style={styles.grid}>
        {services.map((service, index) => (
          <AnimatedCard key={index} delay={index * 100}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(service.route as any)}
              style={styles.cardContent}
            >
              <View style={[styles.iconContainer, { backgroundColor: service.color }]}>
                {service.icon}
              </View>
              
              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>{service.title}</Text>
                  <ChevronRight size={18} color="#94A3B8" />
                </View>
                <Text style={styles.cardDescription}>{service.description}</Text>
              </View>
            </TouchableOpacity>
          </AnimatedCard>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  grid: {
    paddingHorizontal: 16,
    gap: 16, // Spacing between AnimatedCards
    paddingBottom: 40,
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  cardDescription: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 18,
  },
});

export default AepsPaysprint;