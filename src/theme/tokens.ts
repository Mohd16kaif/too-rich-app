const colors = {
  background: '#FFFFFF',
  surfaceMuted: '#F3F4F6',
  textPrimary: '#0A0A0A',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  black: '#0A0A0A',
  white: '#FFFFFF',
  destructive: '#DC2626',
  cardBackground: '#111113',
  cardBorder: '#2A2A2E',
  cardAccent: '#D9CDB8',
  cardTextSecondary: '#9C9CA3',
} as const;

const fonts = {
  fontRegular: 'GeneralSans-Regular',
  fontMedium: 'GeneralSans-Medium',
  fontSemibold: 'GeneralSans-Semibold',
  fontBold: 'GeneralSans-Bold',
  fontSerifRegular: 'Fraunces-Regular',
  fontSerifItalic: 'Fraunces-Italic',
  fontSerifMedium: 'Fraunces-Medium',
  fontSerifSemibold: 'Fraunces-SemiBold',
  fontSerifBold: 'Fraunces-Bold',
} as const;

const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xl2: 24,
  xl3: 32,
  xl4: 40,
  xl5: 48,
} as const;

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xl2: 48,
} as const;

const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

const photoCircleSize = 200 as const;

const theme = {
  colors,
  fonts,
  fontSizes,
  spacing,
  radius,
  photoCircleSize,
} as const;

export type Theme = typeof theme;
export type ThemeColors = typeof colors;
export type ThemeFonts = typeof fonts;

export default theme;