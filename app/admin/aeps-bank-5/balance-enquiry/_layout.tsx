import { Stack } from "expo-router";

export default function BalanceEnquiryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Balance Enquiry" }} />
    </Stack>
  );
}