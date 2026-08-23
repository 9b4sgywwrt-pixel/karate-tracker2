import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { SessionsProvider } from '@/data/sessions-context';
import { CalendarProvider } from '@/data/calendar-context';
import { AuthProvider } from '@/cloud/auth-context';
import { SyncProvider } from '@/cloud/sync-context';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
const icons: Record<string, { active: IconName; inactive: IconName }> = {
  index: { active: 'home-variant', inactive: 'home-variant-outline' },
  diary: { active: 'book-open-variant', inactive: 'book-open-outline' },
  log: { active: 'plus', inactive: 'plus' },
  calendar: { active: 'calendar-month', inactive: 'calendar-month-outline' },
  progress: { active: 'chart-box', inactive: 'chart-box-outline' },
};
export default function RootLayout() {
  return <SafeAreaProvider><RootTabs /></SafeAreaProvider>;
}

function RootTabs() {
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
    <AuthProvider><SessionsProvider><CalendarProvider><SyncProvider><ThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tabs tabBar={(props) => <AppTabBar {...props} />} screenOptions={{
        headerShown: false, sceneStyle: { backgroundColor: colors.background },
        tabBarIcon: () => null,
      }}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="diary" options={{ title: 'Diary' }} />
        <Tabs.Screen name="log" options={{ title: 'Log' }} />
        <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
        <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
        <Tabs.Screen name="session" options={{ href: null }} />
        <Tabs.Screen name="session/[id]" options={{ href: null }} />
        <Tabs.Screen name="account" options={{ href: null }} />
      </Tabs>
    </ThemeProvider></SyncProvider></CalendarProvider></SessionsProvider></AuthProvider>
  );
}

const mainTabs = ['index', 'diary', 'log', 'calendar', 'progress'] as const;
type AppTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

function AppTabBar({ state, descriptors, navigation, insets }: AppTabBarProps) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const isMobile = width <= 430;
  const bottomPadding = Math.max(insets.bottom, width <= 430 ? 20 : 12);

  return <View style={[styles.tabBar, { paddingBottom: bottomPadding, backgroundColor: colors.surface, borderTopColor: colors.border }]}>
    <View style={styles.tabRow}>
      {mainTabs.map((routeName) => {
        const routeIndex = state.routes.findIndex((route) => route.name === routeName);
        if (routeIndex < 0) return null;
        const route = state.routes[routeIndex];
        const focused = state.index === routeIndex;
        const label = routeName === 'index' ? 'Home' : routeName[0].toUpperCase() + routeName.slice(1);
        const color = focused || routeName === 'log' ? colors.primary : colors.textMuted;
        const icon = icons[routeName];
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };

        return <Pressable
          key={route.key}
          accessibilityRole="tab"
          accessibilityState={{ selected: focused }}
          accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel ?? label}
          onPress={onPress}
          style={({ pressed }) => [styles.tabItem, { opacity: pressed ? 0.68 : 1 }]}
        >
          <View style={styles.iconArea}>
            {routeName === 'log'
              ? isMobile
                ? <View style={[styles.logCircle, { backgroundColor: colors.primary }]}><AppText style={styles.mobilePlus} color={colors.onPrimary}>+</AppText></View>
                : <AppText style={styles.desktopPlus} color={colors.primary}>+</AppText>
              : <MaterialCommunityIcons name={focused ? icon.active : icon.inactive} size={24} color={color} />}
          </View>
          <AppText variant="caption" weight="medium" color={color} style={styles.tabLabel}>{label}</AppText>
        </Pressable>;
      })}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  tabBar: { flexShrink: 0, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
  tabRow: { width: '100%', maxWidth: 720, alignSelf: 'center', flexDirection: 'row' },
  tabItem: { flex: 1, flexBasis: 0, minWidth: 0, height: 62, alignItems: 'center', justifyContent: 'flex-start' },
  iconArea: { width: '100%', height: 42, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { marginTop: 2, fontSize: 10, lineHeight: 14, textAlign: 'center' },
  logCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  mobilePlus: { fontSize: 28, lineHeight: Platform.OS === 'web' ? 32 : 30, textAlign: 'center' },
  desktopPlus: { fontSize: 28, lineHeight: 30, textAlign: 'center' },
});
