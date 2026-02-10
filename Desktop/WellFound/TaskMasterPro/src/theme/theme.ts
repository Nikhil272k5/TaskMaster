/**
 * Theme System — Dark + Light mode
 * Glassmorphism tokens, gradients, shadows, typography, spacing
 * Used with Styled Components ThemeProvider
 */

/** Spacing scale (4px base) */
export const Spacing = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
} as const;

/** Border radius tokens */
export const Radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 999,
} as const;

/** Font sizes */
export const FontSize = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    hero: 40,
} as const;

/** Font weights */
export const FontWeight = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
};

/** Dark theme palette */
const darkColors = {
    /** Gradient background */
    gradientStart: '#0F0C29',
    gradientMid: '#302B63',
    gradientEnd: '#24243E',

    /** Surfaces */
    background: '#0F0C29',
    surface: 'rgba(255, 255, 255, 0.06)',
    surfaceElevated: 'rgba(255, 255, 255, 0.10)',
    card: 'rgba(255, 255, 255, 0.08)',

    /** Glassmorphism */
    glass: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    glassHighlight: 'rgba(255, 255, 255, 0.15)',

    /** Text */
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.75)',
    textMuted: 'rgba(255, 255, 255, 0.45)',
    textDisabled: 'rgba(255, 255, 255, 0.25)',

    /** Input */
    inputBackground: 'rgba(255, 255, 255, 0.08)',
    inputBorder: 'rgba(255, 255, 255, 0.15)',
    inputFocusBorder: '#7C83FD',
    placeholder: 'rgba(255, 255, 255, 0.35)',

    /** Accent & semantic */
    accent: '#7C83FD',
    accentLight: 'rgba(124, 131, 253, 0.20)',
    success: '#6BCB77',
    warning: '#FFD93D',
    error: '#FF6B6B',
    info: '#74B9FF',

    /** Misc */
    border: 'rgba(255, 255, 255, 0.10)',
    divider: 'rgba(255, 255, 255, 0.08)',
    overlay: 'rgba(0, 0, 0, 0.60)',
    tabBar: '#0A0820',
    statusBar: '#0F0C29',
};

/** Light theme palette */
const lightColors = {
    gradientStart: '#F0F2FF',
    gradientMid: '#E8EAFF',
    gradientEnd: '#F5F3FF',

    background: '#F0F2FF',
    surface: 'rgba(255, 255, 255, 0.80)',
    surfaceElevated: 'rgba(255, 255, 255, 0.95)',
    card: 'rgba(255, 255, 255, 0.85)',

    glass: 'rgba(255, 255, 255, 0.60)',
    glassBorder: 'rgba(0, 0, 0, 0.08)',
    glassHighlight: 'rgba(255, 255, 255, 0.90)',

    textPrimary: '#1A1A2E',
    textSecondary: 'rgba(26, 26, 46, 0.75)',
    textMuted: 'rgba(26, 26, 46, 0.45)',
    textDisabled: 'rgba(26, 26, 46, 0.25)',

    inputBackground: 'rgba(0, 0, 0, 0.04)',
    inputBorder: 'rgba(0, 0, 0, 0.12)',
    inputFocusBorder: '#5C63E0',
    placeholder: 'rgba(26, 26, 46, 0.35)',

    accent: '#5C63E0',
    accentLight: 'rgba(92, 99, 224, 0.12)',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#EF5350',
    info: '#42A5F5',

    border: 'rgba(0, 0, 0, 0.08)',
    divider: 'rgba(0, 0, 0, 0.05)',
    overlay: 'rgba(0, 0, 0, 0.40)',
    tabBar: '#FFFFFF',
    statusBar: '#F0F2FF',
};

export type ThemeColors = typeof darkColors;

/** Shadow presets that adapt to theme */
export const Shadows = {
    light: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    heavy: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    }),
} as const;

/** Complete theme object passed to ThemeProvider */
export interface AppTheme {
    mode: 'dark' | 'light';
    colors: ThemeColors;
    spacing: typeof Spacing;
    radius: typeof Radius;
    fontSize: typeof FontSize;
    fontWeight: typeof FontWeight;
}

export const darkTheme: AppTheme = {
    mode: 'dark',
    colors: darkColors,
    spacing: Spacing,
    radius: Radius,
    fontSize: FontSize,
    fontWeight: FontWeight,
};

export const lightTheme: AppTheme = {
    mode: 'light',
    colors: lightColors,
    spacing: Spacing,
    radius: Radius,
    fontSize: FontSize,
    fontWeight: FontWeight,
};

/** Get theme by mode */
export const getTheme = (mode: 'dark' | 'light'): AppTheme =>
    mode === 'dark' ? darkTheme : lightTheme;
