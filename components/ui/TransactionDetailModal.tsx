import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  X,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react-native";
import { theme } from "@/theme";

interface Props {
  visible: boolean;
  transaction: any;
  onClose: () => void;
}

export function TransactionDetailsModal({
  visible,
  transaction,
  onClose,
}: Props) {
  const translateY = useSharedValue(700);

  useEffect(() => {
    translateY.value = visible
      ? withSpring(0, { damping: 18 })
      : withTiming(700);
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!transaction) return null;

  const isCompleted = transaction.status === "completed";
  const isPending = transaction.status === "pending";

  const statusColor = isCompleted
    ? theme.colors.success[500]
    : isPending
    ? theme.colors.warning[500]
    : theme.colors.error[500];

  const StatusIcon = isCompleted
    ? CheckCircle
    : isPending
    ? Clock
    : XCircle;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, animatedStyle]}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Transaction Details</Text>
            <Pressable onPress={onClose}>
              <X size={22} color={theme.colors.text.primary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* HERO AMOUNT */}
            <View style={styles.hero}>
              <Text style={styles.heroLabel}>Total Amount</Text>
              <Text style={styles.heroAmount}>
                ₹{Number(transaction.amount).toFixed(2)}
              </Text>

              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: `${statusColor}20` },
                ]}
              >
                <StatusIcon size={16} color={statusColor} />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {transaction.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* DETAILS */}
            <Card>
              <Info label="Transaction ID" value={transaction.transaction_id} />
              <Divider />
              <Info
                label="Date & Time"
                value={new Date(
                  transaction.created_at.replace(" ", "T")
                ).toLocaleString()}
              />
              <Divider />
              <Info label="Service" value={transaction.group_label || "-"} />
              <Divider />
              <Info label="Type" value={transaction.transaction_type} />
              <Divider />
              <Info
                label="Closing Balance"
                value={`₹${Number(transaction.closing_balance).toFixed(2)}`}
              />
            </Card>

            {/* DESCRIPTION */}
            <Section title="Description">
              <View style={styles.descBox}>
                <Text style={styles.descText}>
                  {transaction.description || "-"}
                </Text>
              </View>
            </Section>

            {/* USER INFO */}
            <Section title="User Information">
              <Card>
                <Info label="User Name" value={transaction.user?.name} />
                <Divider />
                <Info label="User ID" value={transaction.user?.unique_id} />
                <Divider />
                <Info label="Domain" value={transaction.user?.domain} />
              </Card>
            </Section>

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

const Info = ({ label, value }: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const Divider = () => (
  <View style={{ height: 1, backgroundColor: theme.colors.border.light, marginVertical: 10 }} />
);

const Card = ({ children }: any) => (
  <View style={styles.card}>{children}</View>
);

const Section = ({ title, children }: any) => (
  <View style={{ marginTop: 24 }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

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
    maxHeight: "92%",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: theme.typography.fontSizes["2xl"],
    fontWeight: "700",
    color: theme.colors.text.primary,
  },

  hero: {
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    backgroundColor: theme.colors.background.dark,
    marginBottom: 24,
  },
  heroLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: "800",
    marginVertical: 8,
    color: theme.colors.text.primary,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  card: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },

  label: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    color: theme.colors.text.primary,
  },

  descBox: {
    backgroundColor: theme.colors.background.dark,
    padding: 14,
    borderRadius: 12,
  },
  descText: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.text.secondary,
  },
});
