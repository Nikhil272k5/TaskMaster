/**
 * SkeletonLoader — Shimmer placeholder while tasks load
 * Uses Reanimated for smooth shimmer animation
 */
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
} from 'react-native-reanimated';
import { useAppSelector } from '../store';
import { getTheme, Spacing, Radius } from '../theme/theme';

/** Number of skeleton cards to show */
const SKELETON_COUNT = 4;

const SkeletonCard: React.FC<{ index: number }> = ({ index }) => {
    const themeMode = useAppSelector((state) => state.theme.mode);
    const theme = getTheme(themeMode);
    const shimmer = useSharedValue(0);

    useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 1200 }),
            -1,
            true,
        );
    }, [shimmer]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
    }));

    return (
        <Animated.View
            style={[
                styles.card,
                { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder },
                animatedStyle,
            ]}
        >
            <View style={styles.row}>
                <View style={[styles.checkbox, { backgroundColor: theme.colors.surface }]} />
                <View style={styles.content}>
                    <View style={[styles.titleLine, { backgroundColor: theme.colors.surface }]} />
                    <View style={[styles.descLine, { backgroundColor: theme.colors.surface }]} />
                    <View style={styles.tagsRow}>
                        <View style={[styles.tagBox, { backgroundColor: theme.colors.surface }]} />
                        <View style={[styles.tagBox, { backgroundColor: theme.colors.surface, width: 50 }]} />
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};

const SkeletonLoader: React.FC = () => (
    <View style={styles.container}>
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <SkeletonCard key={i} index={i} />
        ))}
    </View>
);

const styles = StyleSheet.create({
    container: { paddingHorizontal: Spacing.lg },
    card: {
        borderRadius: Radius.lg,
        borderWidth: 1,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    checkbox: { width: 24, height: 24, borderRadius: 7, marginRight: Spacing.md },
    content: { flex: 1 },
    titleLine: { height: 16, borderRadius: 4, width: '70%', marginBottom: Spacing.sm },
    descLine: { height: 12, borderRadius: 4, width: '90%', marginBottom: Spacing.sm },
    tagsRow: { flexDirection: 'row', gap: Spacing.sm },
    tagBox: { height: 18, borderRadius: 9, width: 65 },
});

export default SkeletonLoader;
