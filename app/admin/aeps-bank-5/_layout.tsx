import { Stack } from "expo-router";
import { theme } from "@/theme";

export default function AepsBank5Layout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.colors.background.light },
        headerTitleStyle: { 
          color: theme.colors.text.primary,
          fontSize: 18,
          fontWeight: '700' 
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "AEPS Airtel Services" }}
      />
      <Stack.Screen
        name="balance-enquiry"
        options={{ title: "Balance Enquiry" }}
      />
      <Stack.Screen
        name="mini-statement"
        options={{ title: "Mini Statement" }}
      />
      <Stack.Screen
        name="cash-withdrawl"
        options={{ title: "Cash Withdrawal" }}
      />
    </Stack>
  );
}
