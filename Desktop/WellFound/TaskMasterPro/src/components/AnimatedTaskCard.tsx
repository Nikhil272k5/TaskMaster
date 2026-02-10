/**
 * AnimatedTaskCard — Swipeable task card with animated entry/exit
 * Uses Reanimated for layout animations and Gesture Handler for swipe
 * Swipe left to delete, tap checkbox to complete with micro-animation
 */
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Animated, {
    FadeInRight,
    FadeOutLeft,
    Layout,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import {
    Gesture,
    GestureDetector,
} from 'react-native-gesture-handler';
import { useAppSelector, useAppDispatch } from '../store';
import { toggleComplete, removeTask, showSnackbar } from '../store/slices/taskSlice';
import { getTheme, Spacing, FontSize, Radius } from '../theme/theme';
import { PRIORITY_CONFIG, CATEGORY_CONFIG, ANIMATION } from '../utils/constants';
import { formatDate, getRelativeTime, isOverdue, isDueSoon } from '../utils/helpers';
import { Task } from '../types';

interface AnimatedTaskCardProps {
    task: Task;
    index: number;
    onPress: (taskId: string) => void;
}

/** Swipe threshold to trigger delete action */
const SWIPE_THRESHOLD = -120;

const AnimatedTaskCard: React.FC<AnimatedTaskCardProps> = ({ task, index, onPress }) => {
    const dispatch = useAppDispatch();
    const themeMode = useAppSelector((state) => state.theme.mode);
    const theme = getTheme(themeMode);

    const priorityConfig = PRIORITY_CONFIG[task.priority];
    const categoryConfig = CATEGORY_CONFIG[task.category];
    const overdue = !task.isCompleted && isOverdue(task.deadline);
    const dueSoon = !task.isCompleted && !overdue && isDueSoon(task.deadline);

    /** Swipe offset value */
    const translateX = useSharedValue(0);
    /** Checkbox scale for micro-animation */
    const checkScale = useSharedValue(1);

    /** Handle task deletion with undo snackbar */
    const handleDelete = useCallback(() => {
        dispatch(showSnackbar({ message: `"${task.title}" deleted`, task }));
        dispatch(removeTask(task.id));
    }, [dispatch, task]);

    /** Handle completion toggle with micro-animation */
    const handleToggle = useCallback(() => {
        checkScale.value = withSpring(0.8, { damping: 4 }, () => {
            checkScale.value = withSpring(1);
        });
        dispatch(toggleComplete({ taskId: task.id, currentStatus: task.isCompleted }));
    }, [dispatch, task.id, task.isCompleted, checkScale]);

    /** Swipe gesture — slide left to reveal delete */
    const swipeGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            /** Only allow left swipe */
            if (event.translationX < 0) {
                translateX.value = event.translationX;
            }
        })
        .onEnd((event) => {
            if (event.translationX < SWIPE_THRESHOLD) {
                translateX.value = withTiming(-400, { duration: ANIMATION.NORMAL });
                runOnJS(handleDelete)();
            } else {
                translateX.value = withSpring(0);
            }
        });

    /** Animated style for swipe card movement */
    const cardSwipeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    /** Animated style for checkbox bounce */
    const checkboxAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkScale.value }],
    }));

    return (
        <Animated.View
            entering={FadeInRight.delay(index * 60).springify()}
            exiting={FadeOutLeft.duration(ANIMATION.NORMAL)}
            layout={Layout.springify()}
        >
            {/* Delete background revealed on swipe */}
            <View style={[styles.deleteBackground, { backgroundColor: theme.colors.error }]}>
                <Text style={styles.deleteIcon}>🗑️</Text>
                <Text style={styles.deleteText}>Delete</Text>
            </View>

            <GestureDetector gesture={swipeGesture}>
                <Animated.View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.colors.glass,
                            borderColor: overdue
                                ? theme.colors.error + '40'
                                : theme.colors.glassBorder,
                        },
                        cardSwipeStyle,
                    ]}
                >
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onPress(task.id)}
                        style={styles.cardInner}
                    >
                        {/* Priority strip */}
                        <View
                            style={[
                                styles.priorityStrip,
                                {
                                    backgroundColor: task.isCompleted
                                        ? theme.colors.textDisabled
                                        : priorityConfig.color,
                                },
                            ]}
                        />

                        {/* Checkbox */}
                        <TouchableOpacity onPress={handleToggle}>
                            <Animated.View
                                style={[
                                    styles.checkbox,
                                    {
                                        borderColor: task.isCompleted
                                            ? theme.colors.success
                                            : theme.colors.textMuted,
                                        backgroundColor: task.isCompleted
                                            ? theme.colors.success
                                            : 'transparent',
                                    },
                                    checkboxAnimStyle,
                                ]}
                            >
                                {task.isCompleted && <Text style={styles.checkMark}>✓</Text>}
                            </Animated.View>
                        </TouchableOpacity>

                        {/* Content */}
                        <View style={styles.content}>
                            <View style={styles.topRow}>
                                <Text
                                    style={[
                                        styles.title,
                                        { color: theme.colors.textPrimary },
                                        task.isCompleted && {
                                            textDecorationLine: 'line-through',
                                            color: theme.colors.textMuted,
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {task.title}
                                </Text>
                                <View
                                    style={[
                                        styles.priorityBadge,
                                        { backgroundColor: priorityConfig.bgColor },
                                    ]}
                                >
                                    <Text style={styles.priorityIcon}>{priorityConfig.icon}</Text>
                                    <Text style={[styles.priorityLabel, { color: priorityConfig.color }]}>
                                        {priorityConfig.label}
                                    </Text>
                                </View>
                            </View>

                            {task.description ? (
                                <Text
                                    style={[styles.description, { color: theme.colors.textMuted }]}
                                    numberOfLines={1}
                                >
                                    {task.description}
                                </Text>
                            ) : null}

                            <View style={styles.bottomRow}>
                                <View
                                    style={[
                                        styles.categoryBadge,
                                        { backgroundColor: categoryConfig.color + '18' },
                                    ]}
                                >
                                    <Text style={styles.categoryIcon}>{categoryConfig.icon}</Text>
                                    <Text style={[styles.categoryLabel, { color: categoryConfig.color }]}>
                                        {categoryConfig.label}
                                    </Text>
                                </View>

                                {task.tags.slice(0, 2).map((tag) => (
                                    <View
                                        key={tag}
                                        style={[styles.tag, { backgroundColor: theme.colors.surface }]}
                                    >
                                        <Text style={[styles.tagText, { color: theme.colors.textMuted }]}>
                                            #{tag}
                                        </Text>
                                    </View>
                                ))}

                                <View style={styles.spacer} />

                                <Text
                                    style={[
                                        styles.deadline,
                                        {
                                            color: overdue
                                                ? theme.colors.error
                                                : dueSoon
                                                    ? theme.colors.warning
                                                    : theme.colors.textMuted,
                                        },
                                    ]}
                                >
                                    {overdue ? '⚠️ ' : dueSoon ? '⏰ ' : '📅 '}
                                    {getRelativeTime(task.deadline)}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    deleteBackground: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 120,
        borderRadius: Radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    deleteIcon: { fontSize: 20 },
    deleteText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
    card: {
        borderRadius: Radius.lg,
        borderWidth: 1,
        marginBottom: Spacing.sm,
        overflow: 'hidden',
    },
    cardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingRight: Spacing.md,
    },
    priorityStrip: {
        width: 4,
        alignSelf: 'stretch',
        borderTopLeftRadius: Radius.lg,
        borderBottomLeftRadius: Radius.lg,
        marginRight: Spacing.md,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 7,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    checkMark: { color: '#fff', fontSize: 13, fontWeight: '800' },
    content: { flex: 1 },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    title: {
        flex: 1,
        fontSize: FontSize.lg,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: Radius.full,
        gap: 3,
    },
    priorityIcon: { fontSize: 8 },
    priorityLabel: { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'uppercase' },
    description: {
        fontSize: FontSize.md,
        marginTop: 3,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.sm,
        gap: 6,
        flexWrap: 'wrap',
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: Radius.full,
        gap: 4,
    },
    categoryIcon: { fontSize: 11 },
    categoryLabel: { fontSize: FontSize.xs, fontWeight: '600' },
    tag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    tagText: { fontSize: FontSize.xs, fontWeight: '500' },
    spacer: { flex: 1 },
    deadline: { fontSize: FontSize.sm, fontWeight: '500' },
});

export default AnimatedTaskCard;
