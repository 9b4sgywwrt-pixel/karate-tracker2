import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { ChoiceChip, PrimaryButton, SectionHeader } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { radius, spacing } from '@/constants/theme';
import { useSessions } from '@/data/sessions-context';
import { useCalendar } from '@/data/calendar-context';
import { focusOptions, MartialArt, normalizeDraft, SessionDraft, validateSession } from '@/data/session-types';
import { useAppTheme } from '@/hooks/use-app-theme';

const durationOptions = [30, 45, 60, 75];
function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function LogScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const params = useLocalSearchParams<{ id?: string|string[]; scheduleId?:string|string[]; occurrenceId?:string|string[]; date?:string|string[]; art?:string|string[]; start?:string|string[]; end?:string|string[]; duration?:string|string[] }>();
  const editId = Array.isArray(params.id) ? params.id[0] : params.id;
  const param=(value:string|string[]|undefined)=>Array.isArray(value)?value[0]:value;
  const scheduleId=param(params.scheduleId), scheduledOccurrenceId=param(params.occurrenceId);
  const occurrenceDate=param(params.date);
  const { sessions, loading, createSession, updateSession, deleteSession } = useSessions();
  const { completeOccurrence, exceptions } = useCalendar();
  const hydratedId = useRef<string | null>(null);
  const requestedArt=param(params.art) as MartialArt|undefined;
  const initialArt=requestedArt&&focusOptions[requestedArt]?requestedArt:'Karate';
  const [art, setArt] = useState<MartialArt>(initialArt);
  const [primary, setPrimary] = useState<string>(focusOptions[initialArt][0]);
  const [additional, setAdditional] = useState<string[]>(scheduledOccurrenceId?[]:['Kihon', 'Bunkai']);
  const [date, setDate] = useState(param(params.date)??todayKey());
  const [startTime, setStartTime] = useState(param(params.start)??'');
  const [endTime, setEndTime] = useState(param(params.end)??'');
  const [duration, setDuration] = useState(param(params.duration)??'75');
  const [notes, setNotes] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const existing = useMemo(() => sessions.find((session) => session.id === editId), [sessions, editId]);

  useEffect(() => {
    if (!editId || !existing || hydratedId.current === editId) return;
    hydratedId.current = editId;
    setArt(existing.martialArt); setPrimary(existing.primaryFocus); setAdditional(existing.additionalFocuses);
    setDate(existing.date); setStartTime(existing.startTime ?? ''); setEndTime(existing.endTime ?? '');
    setDuration(String(existing.durationMinutes)); setNotes(existing.notes ?? '');
  }, [editId, existing]);
  const chooseArt = (next: MartialArt) => { setArt(next); setPrimary(focusOptions[next][0]); setAdditional([]); setValidationMessage(null); };
  const toggle = (focus: string) => setAdditional((items) => items.includes(focus) ? items.filter((item) => item !== focus) : [...items, focus]);
  const save = async () => {
    const draft = normalizeDraft({ date, startTime, endTime, martialArt: art, primaryFocus: primary, additionalFocuses: additional, durationMinutes: Number(duration), notes, scheduledOccurrenceId: editId ? existing?.scheduledOccurrenceId ?? null : scheduledOccurrenceId ?? null } satisfies SessionDraft);
    const messages = Object.values(validateSession(draft));
    if (messages.length) { setValidationMessage(messages.join(' ')); return; }
    setSaving(true); setValidationMessage(null);
    try {
      if(!editId&&scheduledOccurrenceId&&exceptions.some(item=>item.occurrenceId===scheduledOccurrenceId&&item.status==='completed'))throw new Error('This scheduled training has already been completed.');
      const saved = editId ? await updateSession(editId, draft) : await createSession(draft);
      if(!editId&&scheduleId&&scheduledOccurrenceId){try{await completeOccurrence(scheduleId,occurrenceDate??date,saved.id);}catch(reason){await deleteSession(saved.id);throw reason;}}
      router.replace({ pathname: '/session', params: { id: saved.id } } as Href);
    } catch (reason) { setValidationMessage(reason instanceof Error ? reason.message : 'This session could not be saved. Please try again.'); }
    finally { setSaving(false); }
  };

  if (editId && loading && !existing) return <Screen title="Edit training"><ActivityIndicator color={colors.primary} /></Screen>;
  if (editId && !loading && !existing) return <Screen title="Edit training"><Card><AppText weight="bold">Session not found</AppText><AppText color={colors.textMuted}>Return to the diary and choose a session again.</AppText></Card></Screen>;

  return <Screen title={editId ? 'Edit training' : 'Log training'} subtitle={editId ? 'Update the details of this session' : 'Capture the work while it is fresh'}>
    <SectionHeader title="Date" /><Card style={s.field}><MaterialCommunityIcons name="calendar-blank-outline" size={22} color={colors.primary} /><View style={s.grow}><AppText variant="caption" color={colors.textMuted}>TRAINING DATE</AppText><TextInput accessibilityLabel="Training date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} style={[s.inlineInput, { color: colors.text }]} /></View></Card>
    <SectionHeader title="Martial art" /><View style={s.choices}>{(Object.keys(focusOptions) as MartialArt[]).map((item) => <ChoiceChip key={item} label={item} selected={art === item} onPress={() => chooseArt(item)} />)}</View>
    <SectionHeader title="Primary focus" /><View style={s.choices}>{focusOptions[art].map((item) => <ChoiceChip key={item} label={item} selected={primary === item} onPress={() => { setPrimary(item); setAdditional((items) => items.filter((focus) => focus !== item)); setValidationMessage(null); }} />)}</View>
    <SectionHeader title="Additional focuses" /><View style={s.choices}>{focusOptions[art].filter((item) => item !== primary).map((item) => <ChoiceChip key={item} label={item} selected={additional.includes(item)} onPress={() => toggle(item)} />)}</View>
    <SectionHeader title="Duration" /><View style={s.choices}>{durationOptions.map((minutes) => <ChoiceChip key={minutes} label={minutes < 60 ? `${minutes} min` : minutes === 60 ? '1 hr' : '1 hr 15 min'} selected={duration === String(minutes)} onPress={() => { setDuration(String(minutes)); setValidationMessage(null); }} />)}</View>
    <Card style={s.durationField}><AppText variant="caption" color={colors.textMuted}>TOTAL WHOLE MINUTES</AppText><TextInput accessibilityLabel="Duration in whole minutes" value={duration} onChangeText={setDuration} keyboardType="number-pad" placeholder="75" placeholderTextColor={colors.textMuted} style={[s.inlineInput, { color: colors.text }]} /></Card>
    <SectionHeader title="Time" action="Optional" /><View style={[s.times, compact && s.stack]}><Card style={s.time}><AppText variant="caption" color={colors.textMuted}>START</AppText><TextInput accessibilityLabel="Start time" value={startTime} onChangeText={setStartTime} placeholder="6:00 pm" placeholderTextColor={colors.textMuted} style={[s.inlineInput, { color: colors.text }]} /></Card><Card style={s.time}><AppText variant="caption" color={colors.textMuted}>END</AppText><TextInput accessibilityLabel="End time" value={endTime} onChangeText={setEndTime} placeholder="7:15 pm" placeholderTextColor={colors.textMuted} style={[s.inlineInput, { color: colors.text }]} /></Card></View>
    <SectionHeader title="Notes" action="Optional" /><View style={[s.notes, { backgroundColor: colors.surface, borderColor: colors.border }]}><TextInput multiline accessibilityLabel="Training notes" value={notes} onChangeText={setNotes} placeholder="What did you work on?" placeholderTextColor={colors.textMuted} style={[s.notesInput, { color: colors.text }]} /></View>
    {validationMessage ? <Card style={[s.validation, { borderColor: colors.primarySoft }]}><MaterialCommunityIcons name="alert-circle-outline" size={21} color={colors.primary} /><AppText color={colors.primary} style={s.validationCopy}>{validationMessage}</AppText></Card> : null}
    <View style={s.save}><PrimaryButton icon="check" disabled={saving} onPress={() => void save()}>{saving ? 'Saving…' : editId ? 'Save changes' : 'Save training'}</PrimaryButton></View>
  </Screen>;
}
const s = StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, grow: { flex: 1, gap: 2 }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, inlineInput: { minHeight: 28, fontSize: 16, paddingVertical: 0 },
  durationField: { marginTop: spacing.md, gap: spacing.xs }, times: { flexDirection: 'row', gap: spacing.md }, stack: { flexDirection: 'column' }, time: { flex: 1, minWidth: 0, gap: spacing.xs }, notes: { minHeight: 118, borderWidth: 1, borderRadius: radius.md, padding: spacing.md },
  notesInput: { minHeight: 86, fontSize: 16, textAlignVertical: 'top' }, validation: { marginTop: spacing.lg, flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }, validationCopy: { flex: 1 }, save: { marginTop: spacing.xl },
});
