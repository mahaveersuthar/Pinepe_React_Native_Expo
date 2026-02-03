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
} from "react-native-reanimated";
import { X, ArrowRight } from "lucide-react-native";
import { theme } from "@/theme";
import Toast from "react-native-toast-message";

interface Props {
  visible: boolean;
  pipe: string;
  onClose: () => void;
  onSendOtp: (amount: string) => Promise<boolean>;
  onTransfer: (otp: string) => void;
}

export default function DmtTransferModal({
  visible,
  pipe,
  onClose,
  onSendOtp,
  onTransfer,
}: Props) {
  const translateY = useSharedValue(700);

  const [amount, setAmount] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    translateY.value = visible
      ? withSpring(0, { damping: 18 })
      : withTiming(700);
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSendOtp = async () => {
    if (!amount || Number(amount) <= 0) {
      Toast.show({ type: "info", text1: "Enter valid amount" });
      return;
    }

    try {
      setLoading(true);
      const success = await onSendOtp(amount);
      if (success) {
        setOtpSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = () => {
    if (otp.length !== 4) {
      Toast.show({ type: "info", text1: "Enter valid OTP" });
      return;
    }
    onTransfer(otp);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, animatedStyle]}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Send Money</Text>
            <Pressable onPress={onClose}>
              <X size={22} />
            </Pressable>
          </View>

          {/* AMOUNT */}
          <View style={styles.section}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              placeholder="Enter amount"
              style={styles.input}
            />
          </View>

          {/* PIPE */}
          <View style={styles.section}>
            <Text style={styles.label}>Pipe</Text>
            <View style={styles.readonlyBox}>
              <Text style={styles.readonlyText}>{pipe}</Text>
            </View>
          </View>

          {/* OTP INPUT */}
          {otpSent && (
            <View style={styles.section}>
              <Text style={styles.label}>Enter OTP</Text>
              <TextInput
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="4 digit OTP"
                style={styles.input}
              />
            </View>
          )}

          {/* ACTION BUTTON */}
          <Pressable
            style={[styles.actionBtn, loading && { opacity: 0.6 }]}
            onPress={otpSent ? handleTransfer : handleSendOtp}
            disabled={loading}
          >
            <Text style={styles.actionText}>
              {otpSent ? "Transfer Money" : "Send OTP"}
            </Text>
            <ArrowRight color="#FFF" size={18} />
          </Pressable>

          <View style={{ height: 20 }} />
        </Animated.View>
      </View>
    </Modal>
  );
}
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
    maxHeight: "85%",
  },

  /* ---------- HEADER ---------- */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: theme.typography.fontSizes["2xl"],
    fontWeight: "800",
    color: theme.colors.text.primary,
  },

  /* ---------- FORM ---------- */
  section: {
    marginBottom: 18,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.text.secondary,
    marginBottom: 6,
  },

  input: {
    height: 52,
    borderRadius: 14,
    backgroundColor: theme.colors.background.dark,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },

  readonlyBox: {
    height: 52,
    borderRadius: 14,
    backgroundColor: theme.colors.background.dark,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },

  readonlyText: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.primary[600],
  },

  /* ---------- ACTION ---------- */
  actionBtn: {
    marginTop: 10,
    backgroundColor: theme.colors.primary[600],
    height: 56,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  actionText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
