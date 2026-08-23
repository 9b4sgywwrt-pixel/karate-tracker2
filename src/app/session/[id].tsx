import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { PrimaryButton, SectionHeader } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { radius, spacing } from '@/constants/theme';
import { useSessions } from '@/data/sessions-context';
import { formatDuration, formatSessionDate, TrainingSession } from '@/data/session-types';
import { useAppTheme } from '@/hooks/use-app-theme';

function confirmDelete(): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm('Delete this training session? This cannot be undone.'));
  return new Promise((resolve) => Alert.alert('Delete training session?', 'This cannot be undone.', [
    { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
    { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
  ], { cancelable: true, onDismiss: () => resolve(false) }));
}

export default function SessionDetailScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { getSession, deleteSession } = useSessions();
  const [session, setSession] = useState<TrainingSession | null | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => { void getSession(id).then(setSession); }, [getSession, id]);
  const remove = async () => {
    if (!await confirmDelete()) return;
    setDeleting(true);
    try { await deleteSession(id); router.replace('/diary'); }
    finally { setDeleting(false); }
  };
  if (session === undefined) return <Screen title="Training session"><ActivityIndicator color={colors.primary} /></Screen>;
  if (!session) return <Screen title="Training session"><Card><AppText variant="heading" weight="bold">Session not found</AppText><AppText color={colors.textMuted}>It may already have been deleted.</AppText></Card></Screen>;
  return <Screen eyebrow={formatSessionDate(session.date, { weekday: 'long', day: 'numeric', month: 'long' })} title={`${session.martialArt} training`} subtitle={formatDuration(session.durationMinutes)}>
    <Card style={s.summary}><Detail label="Primary focus" value={session.primaryFocus} /><Detail label="Additional focuses" value={session.additionalFocuses.length ? session.additionalFocuses.join(', ') : 'None'} /><Detail label="Start time" value={session.startTime ?? 'Not recorded'} /><Detail label="End time" value={session.endTime ?? 'Not recorded'} /><Detail label="Duration" value={formatDuration(session.durationMinutes)} last /></Card>
    <SectionHeader title="Notes" /><Card><AppText color={session.notes ? colors.text : colors.textMuted}>{session.notes ?? 'No notes were added.'}</AppText></Card>
    <SectionHeader title="Record details" /><Card style={s.timestamps}><Detail label="Created" value={new Date(session.createdAt).toLocaleString('en-AU')} /><Detail label="Last updated" value={new Date(session.updatedAt).toLocaleString('en-AU')} last /></Card>
    <View style={s.actions}><PrimaryButton icon="pencil" onPress={() => router.push({ pathname: '/log', params: { id: session.id } })}>Edit session</PrimaryButton><Pressable accessibilityRole="button" onPress={() => void remove()} style={({ pressed }) => [s.deleteButton, { borderColor: colors.primary, opacity: pressed ? 0.7 : 1 }]}><MaterialCommunityIcons name="delete-outline" size={20} color={colors.primary} /><AppText weight="bold" color={colors.primary}>{deleting ? 'Deleting…' : 'Delete session'}</AppText></Pressable></View>
  </Screen>;
}

function Detail({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { colors } = useAppTheme();
  return <View style={[s.detail, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}><AppText variant="caption" color={colors.textMuted}>{label.toUpperCase()}</AppText><AppText weight="medium">{value}</AppText></View>;
}
const s = StyleSheet.create({
  summary: { paddingVertical: spacing.xs }, timestamps: { paddingVertical: spacing.xs }, detail: { paddingVertical: spacing.md, gap: spacing.xs }, actions: { marginTop: spacing.xl, gap: spacing.md }, deleteButton: { minHeight: 52, borderWidth: 1, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
});
