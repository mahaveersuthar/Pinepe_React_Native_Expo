import React from "react";
import { View, Text, Pressable } from "react-native";
import { Clock, RefreshCcw } from "lucide-react-native";
import { theme } from "@/theme";

type Props = {
  onRefresh: () => void;
};

const OnboardingUnderReview = ({ onRefresh }: Props) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
      }}
    >
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 24,
          padding: 24,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 5,
        }}
      >
        {/* Icon */}
        <View
          style={{
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: "#FFF7ED",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#FED7AA",
            }}
          >
            <Clock size={42} color="#F97316" />
          </View>
        </View>

        {/* Heading */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            textAlign: "center",
            color: "#111827",
          }}
        >
          Onboarding{" "}
          <Text style={{ color: "#F97316" }}>Under Review</Text>
        </Text>

        {/* Description */}
        <Text
          style={{
            textAlign: "center",
            marginTop: 10,
            fontSize: 14,
            color: "#6B7280",
            lineHeight: 20,
          }}
        >
          Your AEPS registration has been successfully submitted and is currently
          being reviewed by our compliance team.
        </Text>

        {/* ETA Box */}
        <View
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 16,
            backgroundColor: "#F9FAFB",
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 12,
              fontWeight: "600",
              color: "#9CA3AF",
            }}
          >
            ESTIMATED APPROVAL TIME
          </Text>

          <Text
            style={{
              textAlign: "center",
              fontSize: 18,
              fontWeight: "700",
              marginTop: 4,
              color: "#111827",
            }}
          >
            6 – 8 Business Hours
          </Text>

          {/* Progress bar */}
          <View
            style={{
              marginTop: 12,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#E5E7EB",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: "70%",
                height: "100%",
                backgroundColor: "#F97316",
              }}
            />
          </View>
        </View>

        {/* Refresh Button */}
        <Pressable
          onPress={onRefresh}
          style={{
            marginTop: 24,
            backgroundColor: theme.colors.primary[500],
            borderRadius: 14,
            paddingVertical: 14,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
          }}
        >
          <RefreshCcw size={18} color="#fff" />
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            Check Updated Status
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default OnboardingUnderReview;
