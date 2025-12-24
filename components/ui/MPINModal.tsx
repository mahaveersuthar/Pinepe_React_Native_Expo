import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { X } from "lucide-react-native";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

import { theme } from "@/theme";
import { getLatLong } from "@/utils/location";
import { setMpinApi } from "@/app/api/mpin.api";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SetupMPINModal({
  visible,
  onClose,
  onSuccess,
}: Props) {
  const translateY = useSharedValue(500);
  const shake = useSharedValue(0);

  const tenantData = Constants.expoConfig?.extra?.tenantData;
  const domainName = tenantData?.domain || "laxmeepay.com";

  const [otp, setOtp] = useState("");
  const [mpin, setMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- ANIMATION ---------------- */
  useEffect(() => {
    translateY.value = visible
      ? withSpring(0, { damping: 20 })
      : withTiming(500);

    if (visible) {
      setOtp("");
      setMpin("");
      setConfirmMpin("");
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const triggerShake = () => {
    shake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  /* ---------------- SET MPIN ---------------- */
  const handleSetMpin = async () => {
    if (otp.length !== 4) {
      triggerShake();
      Toast.show({
        type: "error",
        text1: "Invalid OTP",
        text2: "Please enter 4-digit OTP",
      });
      return;
    }

    if (mpin.length !== 4 || confirmMpin.length !== 4) {
      triggerShake();
      Toast.show({
        type: "error",
        text1: "Invalid MPIN",
        text2: "MPIN must be 4 digits",
      });
      return;
    }

    if (mpin !== confirmMpin) {
      triggerShake();
      Toast.show({
        type: "error",
        text1: "MPIN Mismatch",
        text2: "MPIN and Confirm MPIN must match",
      });
      return;
    }

    try {
      setLoading(true);

      const location = await getLatLong();
      const token = await SecureStore.getItemAsync("userToken");

      if (!location || !token) return;

      const res = await setMpinApi({
        domain: domainName,
        latitude: location.latitude,
        longitude: location.longitude,
        token,
        otp,
        mpin,
      });

      if (res.success) {
        Toast.show({
          type: "success",
          text1: "MPIN Updated",
          text2: res.message || "MPIN set successfully",
        });

        onSuccess();
        onClose();
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: err.message || "Unable to set MPIN",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, animatedStyle]}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Reset MPIN</Text>
            <Pressable onPress={onClose}>
              <X size={22} color={theme.colors.text.primary} />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Enter the OTP sent to your registered email to reset your MPIN.
          </Text>

          <Animated.View style={shakeStyle}>
            <Input
              label="Enter OTP"
              value={otp}
              keyboardType="number-pad"
              maxLength={4}
              onChangeText={(v: string) =>
                /^\d*$/.test(v) && setOtp(v)
              }
            />

            <Input
              label="Enter New 4-digit MPIN"
              value={mpin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              onChangeText={(v: string) =>
                /^\d*$/.test(v) && setMpin(v)
              }
            />

            <Input
              label="Confirm New 4-digit MPIN"
              value={confirmMpin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              onChangeText={(v: string) =>
                /^\d*$/.test(v) && setConfirmMpin(v)
              }
            />
          </Animated.View>

          {/* ACTIONS */}
          <View style={styles.actions}>
            <Pressable style={styles.backBtn} onPress={onClose}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <Pressable
              style={[
                styles.primaryBtn,
                loading && { opacity: 0.6 },
              ]}
              onPress={handleSetMpin}
              disabled={loading}
            >
              <Text style={styles.primaryText}>
                {loading ? "Setting..." : "Set New MPIN"}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

/* ---------------- INPUT ---------------- */
const Input = ({ label, ...props }: any) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[
          styles.input,
          focused && { borderColor: theme.colors.primary[500] },
        ]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
};

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: theme.colors.background.light,
    borderTopLeftRadius: theme.borderRadius["2xl"],
    borderTopRightRadius: theme.borderRadius["2xl"],
    padding: theme.spacing[6],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: theme.typography.fontSizes["2xl"],
    fontWeight: "700",
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  backBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: theme.colors.border.light,
    borderRadius: 8,
    alignItems: "center",
  },
  backText: {
    fontWeight: "600",
  },
  primaryBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: theme.colors.primary[500],
    borderRadius: 8,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
});
