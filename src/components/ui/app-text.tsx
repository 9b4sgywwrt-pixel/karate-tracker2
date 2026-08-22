import { Text, TextProps, TextStyle } from 'react-native';
import { fonts, typeScale } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';
type Props = TextProps & { variant?: Variant; color?: string; weight?: 'regular' | 'medium' | 'bold' };
const variants: Record<Variant, TextStyle> = {
  display: { fontSize: typeScale.display, lineHeight: 40, letterSpacing: -1.1 },
  title: { fontSize: typeScale.title, lineHeight: 32, letterSpacing: -0.5 },
  heading: { fontSize: typeScale.heading, lineHeight: 25, letterSpacing: -0.2 },
  body: { fontSize: typeScale.body, lineHeight: 23 },
  label: { fontSize: typeScale.label, lineHeight: 18, letterSpacing: 0.7 },
  caption: { fontSize: typeScale.caption, lineHeight: 17 },
};

export function AppText({ variant = 'body', color, weight = 'regular', style, ...props }: Props) {
  const { colors } = useAppTheme();
  const fontFamily = weight === 'bold' ? fonts?.bold : weight === 'medium' ? fonts?.medium : fonts?.regular;
  return <Text {...props} style={[variants[variant], { color: color ?? colors.text, fontFamily }, style]} />;
}
