import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/use-app-theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
const icons: Record<string, { active: IconName; inactive: IconName }> = {
  index: { active: 'home-variant', inactive: 'home-variant-outline' },
  diary: { active: 'book-open-variant', inactive: 'book-open-outline' },
  log: { active: 'plus', inactive: 'plus' },
  calendar: { active: 'calendar-month', inactive: 'calendar-month-outline' },
  progress: { active: 'chart-box', inactive: 'chart-box-outline' },
};
export default function RootLayout() {
  const { colors, isDark } = useAppTheme();
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };
  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Tabs screenOptions={({ route }) => ({
          headerShown: false, sceneStyle: { backgroundColor: colors.background },
          tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIconStyle: styles.tabIconSlot,
          tabBarStyle: [styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.border }],
          tabBarIcon: ({ color, focused, size }) => {
            const icon = icons[route.name] ?? icons.index;
            const isLog = route.name === 'log';
            return <View style={isLog ? [styles.logIcon, { backgroundColor: colors.primary }] : undefined}><MaterialCommunityIcons name={focused ? icon.active : icon.inactive} size={isLog ? 27 : size} color={isLog ? colors.onPrimary : color} /></View>;
          },
        })}>
          <Tabs.Screen name="index" options={{ title: 'Home' }} />
          <Tabs.Screen name="diary" options={{ title: 'Diary' }} />
          <Tabs.Screen name="log" options={{ title: 'Log' }} />
          <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
          <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
        </Tabs>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  tabBar: { height: 88, paddingTop: 6, paddingBottom: 10 },
  tabIconSlot: { height: 48 },
  tabLabel: { fontSize: 11, lineHeight: 14, fontWeight: '600', marginTop: 4 },
  logIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', transform: [{ translateY: -8 }] },
});
