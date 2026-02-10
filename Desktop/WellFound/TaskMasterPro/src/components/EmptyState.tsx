/**
 * EmptyState — Placeholder when task list is empty
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, BounceIn } from 'react-native-reanimated';
import { useAppSelector } from '../store';
import { getTheme, FontSize, Spacing } from '../theme/theme';

interface EmptyStateProps {
    title?: string;
    message?: string;
    icon?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'No Tasks Yet!',
    message = 'Tap the + button to create your first task and start being productive!',
    icon = '📝',
}) => {
    const themeMode = useAppSelector((state) => state.theme.mode);
    const theme = getTheme(themeMode);

    return (
        <Animated.View entering={FadeIn.duration(500)} style={styles.container}>
            <Animated.Text entering={BounceIn.delay(200)} style={styles.icon}>
                {icon}
            </Animated.Text>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
            <Text style={[styles.message, { color: theme.colors.textMuted }]}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', paddingVertical: Spacing.xxxl, paddingHorizontal: Spacing.xxl },
    icon: { fontSize: 64, marginBottom: Spacing.lg },
    title: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.sm, textAlign: 'center' },
    message: { fontSize: FontSize.md, textAlign: 'center', lineHeight: 22 },
});

export default EmptyState;
