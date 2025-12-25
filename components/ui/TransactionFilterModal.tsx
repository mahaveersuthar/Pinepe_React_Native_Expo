import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Check,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import { theme } from "@/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    type: "credit" | "debit" | null;
    fromDate: Date | null;
    toDate: Date | null;
  }) => void;
  onReset: () => void;
}

export function TransactionFilterModal({
  visible,
  onClose,
  onApply,
  onReset,
}: Props) {
  const translateY = useSharedValue(600);

  const [type, setType] = useState<"credit" | "debit" | null>(null);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    translateY.value = visible
      ? withSpring(0, { damping: 18 })
      : withTiming(600);
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  /* ---------------- VALIDATION ---------------- */

  const isFutureDate = (date: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date > today;
  };

  const validateDates = () => {
    if (fromDate && isFutureDate(fromDate)) {
      Toast.show({
        type: "error",
        text1: "Invalid From Date",
        text2: "From date cannot be in the future",
      });
      return false;
    }

    if (toDate && isFutureDate(toDate)) {
      Toast.show({
        type: "error",
        text1: "Invalid To Date",
        text2: "To date cannot be in the future",
      });
      return false;
    }

    if (fromDate && toDate && fromDate > toDate) {
      Toast.show({
        type: "error",
        text1: "Invalid Date Range",
        text2: "From date must be before To date",
      });
      return false;
    }

    return true;
  };

  /* ---------------- ACTIONS ---------------- */

  const resetFilters = () => {
    setType(null);
    setFromDate(null);
    setToDate(null);
    onReset();
    onClose();
  };

  const applyFilters = () => {
    if (!validateDates()) return;

    onApply({ type, fromDate, toDate });
    onClose();
  };

  /* ---------------- UI ---------------- */

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: "flex-end",
        }}
      >
        <Animated.View
          style={[
            {
              backgroundColor: theme.colors.background.light,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              maxHeight: "85%",
            },
            animatedStyle,
          ]}
        >
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: theme.colors.text.primary,
              }}
            >
              Filter Transactions
            </Text>

            <Pressable onPress={onClose}>
              <X size={22} color={theme.colors.text.primary} />
            </Pressable>
          </View>

          {/* TRANSACTION TYPE */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 10,
            }}
          >
            Transaction Type
          </Text>

          <View style={{ flexDirection: "row", gap: 12 }}>
            {/* CREDIT */}
            <Pressable
              onPress={() => setType(type === "credit" ? null : "credit")}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor:
                  type === "credit"
                    ? theme.colors.success[50]
                    : theme.colors.background.dark,
                borderWidth: 1,
                borderColor:
                  type === "credit"
                    ? theme.colors.success[500]
                    : theme.colors.border.light,
              }}
            >
              <ArrowDownLeft size={18} color={theme.colors.success[500]} />
              <Text style={{ fontWeight: "700" }}>Credit</Text>
              {type === "credit" && (
                <Check size={16} color={theme.colors.success[500]} />
              )}
            </Pressable>

            {/* DEBIT */}
            <Pressable
              onPress={() => setType(type === "debit" ? null : "debit")}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor:
                  type === "debit"
                    ? theme.colors.error[50]
                    : theme.colors.background.dark,
                borderWidth: 1,
                borderColor:
                  type === "debit"
                    ? theme.colors.error[500]
                    : theme.colors.border.light,
              }}
            >
              <ArrowUpRight size={18} color={theme.colors.error[500]} />
              <Text style={{ fontWeight: "700" }}>Debit</Text>
              {type === "debit" && (
                <Check size={16} color={theme.colors.error[500]} />
              )}
            </Pressable>
          </View>

          {/* DATE RANGE */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 10,
              }}
            >
              Date Range
            </Text>

            {/* FROM DATE */}
            <Pressable
              onPress={() => setShowFromPicker(true)}
              style={{
                padding: 14,
                borderRadius: 10,
                backgroundColor: theme.colors.background.dark,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: theme.colors.text.secondary }}>
                From Date
              </Text>
              <Text style={{ fontWeight: "700" }}>
                {fromDate ? fromDate.toDateString() : "Select date"}
              </Text>
            </Pressable>

            {/* TO DATE */}
            <Pressable
              onPress={() => setShowToPicker(true)}
              style={{
                padding: 14,
                borderRadius: 10,
                backgroundColor: theme.colors.background.dark,
              }}
            >
              <Text style={{ color: theme.colors.text.secondary }}>
                To Date
              </Text>
              <Text style={{ fontWeight: "700" }}>
                {toDate ? toDate.toDateString() : "Select date"}
              </Text>
            </Pressable>
          </View>

          {/* ACTION BUTTONS */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginTop: 30,
            }}
          >
            <Pressable
              onPress={resetFilters}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 12,
                backgroundColor: theme.colors.border.light,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <RotateCcw size={16} />
              <Text style={{ fontWeight: "700" }}>Reset</Text>
            </Pressable>

            <Pressable
              onPress={applyFilters}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 12,
                backgroundColor: theme.colors.primary[500],
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "800", color: "#fff" }}>
                Apply Filter
              </Text>
            </Pressable>
          </View>

          {/* DATE PICKERS */}
          {showFromPicker && (
            <DateTimePicker
              value={fromDate || new Date()}
              mode="date"
              maximumDate={new Date()}   // ✅ blocks future
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                setShowFromPicker(false);
                if (date) setFromDate(date);
              }}
            />
          )}

          {showToPicker && (
            <DateTimePicker
              value={toDate || new Date()}
              mode="date"
              maximumDate={new Date()}   
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                setShowToPicker(false);
                if (date) setToDate(date);
              }}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}
