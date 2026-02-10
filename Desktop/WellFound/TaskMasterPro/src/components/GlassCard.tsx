/**
 * GlassCard — Glassmorphism container component
 * Provides frosted glass effect with subtle border highlight
 * Works in both dark and light themes
 */
import React from 'react';
import { ViewStyle, StyleSheet, View } from 'react-native';
import { useAppSelector } from '../store';
import { getTheme, Radius, Spacing, Shadows } from '../theme/theme';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    elevated?: boolean;
    noPadding?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    elevated = false,
    noPadding = false,
}) => {
    const themeMode = useAppSelector((state) => state.theme.mode);
    const theme = getTheme(themeMode);

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: elevated ? theme.colors.surfaceElevated : theme.colors.glass,
                    borderColor: theme.colors.glassBorder,
                },
                !noPadding && styles.padded,
                elevated && Shadows.medium,
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: Radius.lg,
        borderWidth: 1,
        overflow: 'hidden',
    },
    padded: {
        padding: Spacing.lg,
    },
});

export default GlassCard;
