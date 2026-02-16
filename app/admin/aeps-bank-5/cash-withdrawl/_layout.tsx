import { Stack } from "expo-router";

export default function CashWithdrawlLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Cash Withdrawal" }} />
    </Stack>
  );
}