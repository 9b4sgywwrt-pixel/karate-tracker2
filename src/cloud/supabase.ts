import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;
export const supabaseConfigured = Boolean(url && key);
export const supabase = createClient(url ?? 'https://configuration-required.invalid', key ?? 'configuration-required', {
  auth: { ...(Platform.OS === 'web' ? {} : { storage: AsyncStorage }), autoRefreshToken: true, persistSession: true, detectSessionInUrl: Platform.OS === 'web', lock: processLock },
});
if (Platform.OS !== 'web') AppState.addEventListener('change', (state) => state === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh());
