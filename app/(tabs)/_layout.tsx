import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Home, User, Receipt, Grid } from 'lucide-react-native';
import { theme } from '@/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.iconContainer}>
              <Home size={size} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.iconContainer}>
              <Receipt size={size} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.iconContainer}>
              <Grid size={size} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.iconContainer}>
              <User size={size} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: theme.spacing[5],
    left: theme.spacing[5],
    right: theme.spacing[5],
    backgroundColor: theme.colors.background.light,
    borderRadius: theme.borderRadius.xl,
    height: 70,
    paddingBottom: theme.spacing[2],
    paddingTop: theme.spacing[2],
    ...theme.shadows.xl,
  },
  tabBarLabel: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.medium,
  },
  tabBarItem: {
    paddingVertical: theme.spacing[1],
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
