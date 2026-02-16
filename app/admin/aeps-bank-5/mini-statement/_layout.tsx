import { Stack } from "expo-router";

export default function MiniStatementLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Mini Statement" }} />
    </Stack>
  );
}