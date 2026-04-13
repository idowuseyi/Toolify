export const Theme = {
  colors: {
    background: '#121212', // Deep charcoal / almost black
    surface: '#1E1E1E',   // Slightly lighter charcoal for cards
    surfaceLight: '#2C2C2C', // Even lighter for inputs/hover states
    primary: '#00E5FF',   // Electric Blue accent
    secondary: '#8a2be2', // Neon purple alternative accent
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: '#333333',
    error: '#CF6679',
    success: '#03DAC6',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  radii: {
    s: 4,
    m: 8,
    l: 12,
    xl: 20,
    round: 9999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' as const },
    h2: { fontSize: 24, fontWeight: 'bold' as const },
    h3: { fontSize: 20, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: 'normal' as const },
    caption: { fontSize: 14, fontWeight: 'normal' as const },
  }
};
