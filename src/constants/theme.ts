import { Platform } from 'react-native';

export const palette = {
  light: {
    background: '#F6F4F0', surface: '#FFFFFF', surfaceMuted: '#ECE9E3',
    text: '#18201D', textMuted: '#6A716E', border: '#E1DED8',
    primary: '#A33A2B', onPrimary: '#FFFFFF', primarySoft: '#F4E1DC', accent: '#D9972B',
    success: '#2D7254', successSoft: '#DEEEE5', karate: '#A33A2B',
    bjj: '#32658A', kobudo: '#7A5B2E', hero: '#18201D', onHero: '#FFFFFF',
    onHeroMuted: '#D8DDDA', shadow: '#18201D',
  },
  dark: {
    background: '#111513', surface: '#1B211E', surfaceMuted: '#252C28',
    text: '#F5F3EF', textMuted: '#A8B0AC', border: '#303934',
    primary: '#E17A68', onPrimary: '#24110E', primarySoft: '#432A25', accent: '#EDB456',
    success: '#70B893', successSoft: '#203B2F', karate: '#E17A68',
    bjj: '#75ADD3', kobudo: '#D1AA6D', hero: '#252C28', onHero: '#F5F3EF',
    onHeroMuted: '#BFC7C3', shadow: '#000000',
  },
} as const;

export type AppColors = (typeof palette)['light'];
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 44 } as const;
export const radius = { sm: 10, md: 16, lg: 22, pill: 999 } as const;
export const typeScale = { display: 34, title: 26, heading: 19, body: 16, label: 13, caption: 12 } as const;
export const fonts = Platform.select({
  ios: { regular: 'System', medium: 'System', bold: 'System' },
  android: { regular: 'sans-serif', medium: 'sans-serif-medium', bold: 'sans-serif' },
  default: { regular: 'system-ui', medium: 'system-ui', bold: 'system-ui' },
});
export const contentMaxWidth = 640;
