/**
 * TaskDetailScreen — Full task view with completion toggle,
 * edit, and delete actions
 */
import React, { useMemo } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    StatusBar, Alert,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';
import PriorityBadge from '../components/PriorityBadge';
import { useAppSelector, useAppDispatch } from '../store';
import { toggleComplete, removeTask, showSnackbar } from '../store/slices/taskSlice';
import { getTheme, Spacing, FontSize, Radius } from '../theme/theme';
import { CATEGORY_CONFIG } from '../utils/constants';
import { formatDateTime, getRelativeTime, isOverdue, isDueSoon } from '../utils/helpers';
import { Task } from '../types';

interface TaskDetailScreenProps {
    navigation: { goBack: () => void; navigate: (screen: string, params?: Record<string, unknown>) => void };
    route: { params: { taskId: string } };
}

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ navigation, route }) => {
    const dispatch = useAppDispatch();
    const themeMode = useAppSelector((state) => state.theme.mode);
    const theme = getTheme(themeMode);
    const tasks = useAppSelector((state) => state.tasks.tasks);
    const task = useMemo(() => tasks.find((t) => t.id === route.params.taskId), [tasks, route.params.taskId]);

    if (!task) {
        return (
            <AnimatedBackground>
                <View style={styles.center}>
                    <Text style={[styles.notFound, { color: theme.colors.textMuted }]}>Task not found</Text>
                </View>
            </AnimatedBackground>
        );
    }

    const catConfig = CATEGORY_CONFIG[task.category];
    const overdue = !task.isCompleted && isOverdue(task.deadline);
    const dueSoon = !task.isCompleted && !overdue && isDueSoon(task.deadline);

    const handleToggle = () => {
        dispatch(toggleComplete({ taskId: task.id, currentStatus: task.isCompleted }));
    };

    const handleDelete = () => {
        Alert.alert('Delete Task', `Are you sure you want to delete "${task.title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    dispatch(showSnackbar({ message: `"${task.title}" deleted`, task }));
                    dispatch(removeTask(task.id));
                    navigation.goBack();
                },
            },
        ]);
    };

    const handleEdit = () => {
        navigation.navigate('EditTask', { task });
    };

    return (
        <AnimatedBackground>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={[styles.backIcon, { color: theme.colors.textPrimary }]}>←</Text>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Task Details</Text>
                    <TouchableOpacity onPress={handleEdit} style={styles.editBtn}>
                        <Text style={styles.editIcon}>✏️</Text>
                    </TouchableOpacity>
                </View>

                {/* Status Banner */}
                {task.isCompleted ? (
                    <Animated.View entering={FadeIn}>
                        <GlassCard style={[styles.statusBanner, { borderColor: theme.colors.success + '40' }]}>
                            <Text style={styles.statusIcon}>✅</Text>
                            <View>
                                <Text style={[styles.statusTitle, { color: theme.colors.success }]}>Completed</Text>
                                <Text style={[styles.statusSub, { color: theme.colors.textMuted }]}>
                                    {task.completedAt ? formatDateTime(task.completedAt) : ''}
                                </Text>
                            </View>
                        </GlassCard>
                    </Animated.View>
                ) : overdue ? (
                    <Animated.View entering={FadeIn}>
                        <GlassCard style={[styles.statusBanner, { borderColor: theme.colors.error + '40' }]}>
                            <Text style={styles.statusIcon}>⚠️</Text>
                            <View>
                                <Text style={[styles.statusTitle, { color: theme.colors.error }]}>Overdue</Text>
                                <Text style={[styles.statusSub, { color: theme.colors.textMuted }]}>
                                    Was due {getRelativeTime(task.deadline)}
                                </Text>
                            </View>
                        </GlassCard>
                    </Animated.View>
                ) : null}

                {/* Title & Priority */}
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <GlassCard elevated>
                        <View style={styles.titleRow}>
                            <Text style={[styles.taskTitle, { color: theme.colors.textPrimary }]}>{task.title}</Text>
                            <PriorityBadge priority={task.priority} />
                        </View>
                        {task.description ? (
                            <Text style={[styles.taskDesc, { color: theme.colors.textSecondary }]}>
                                {task.description}
                            </Text>
                        ) : null}
                    </GlassCard>
                </Animated.View>

                {/* Details Grid */}
                <Animated.View entering={FadeInDown.delay(200).springify()}>
                    <GlassCard elevated style={styles.detailCard}>
                        <DetailRow icon="📂" label="Category" value={`${catConfig.icon} ${catConfig.label}`} color={catConfig.color} textColor={theme.colors.textPrimary} mutedColor={theme.colors.textMuted} />
                        <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
                        <DetailRow icon="📅" label="Deadline" value={formatDateTime(task.deadline)} color={overdue ? theme.colors.error : dueSoon ? theme.colors.warning : theme.colors.accent} textColor={theme.colors.textPrimary} mutedColor={theme.colors.textMuted} />
                        <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
                        <DetailRow icon="🕐" label="Created" value={formatDateTime(task.createdAt)} color={theme.colors.textMuted} textColor={theme.colors.textPrimary} mutedColor={theme.colors.textMuted} />
                    </GlassCard>
                </Animated.View>

                {/* Tags */}
                {task.tags.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(300).springify()}>
                        <GlassCard elevated>
                            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>🏷️ Tags</Text>
                            <View style={styles.tagsRow}>
                                {task.tags.map((tag) => (
                                    <View key={tag} style={[styles.tag, { backgroundColor: theme.colors.accentLight }]}>
                                        <Text style={[styles.tagText, { color: theme.colors.accent }]}>#{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </GlassCard>
                    </Animated.View>
                )}

                {/* Actions */}
                <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: task.isCompleted ? theme.colors.warning + '20' : theme.colors.success + '20' }]}
                        onPress={handleToggle}
                    >
                        <Text style={[styles.actionBtnText, { color: task.isCompleted ? theme.colors.warning : theme.colors.success }]}>
                            {task.isCompleted ? '↩️ Mark Pending' : '✅ Mark Complete'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.colors.error + '15' }]}
                        onPress={handleDelete}
                    >
                        <Text style={[styles.actionBtnText, { color: theme.colors.error }]}>🗑️ Delete</Text>
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.bottomSpace} />
            </ScrollView>
        </AnimatedBackground>
    );
};

/** Reusable detail row */
const DetailRow: React.FC<{
    icon: string; label: string; value: string; color: string; textColor: string; mutedColor: string;
}> = ({ icon, label, value, color, textColor, mutedColor }) => (
    <View style={detailStyles.row}>
        <Text style={detailStyles.icon}>{icon}</Text>
        <View>
            <Text style={[detailStyles.label, { color: mutedColor }]}>{label}</Text>
            <Text style={[detailStyles.value, { color: textColor }]}>{value}</Text>
        </View>
    </View>
);

const detailStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
    icon: { fontSize: 20, width: 28 },
    label: { fontSize: FontSize.xs, fontWeight: '600', letterSpacing: 0.5 },
    value: { fontSize: FontSize.md, fontWeight: '600', marginTop: 2 },
});

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 52 },
    content: { paddingHorizontal: Spacing.xl },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    notFound: { fontSize: FontSize.lg },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    backIcon: { fontSize: 24, fontWeight: '700' },
    headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: '700', textAlign: 'center' },
    editBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    editIcon: { fontSize: 20 },
    statusBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
    statusIcon: { fontSize: 28 },
    statusTitle: { fontSize: FontSize.lg, fontWeight: '700' },
    statusSub: { fontSize: FontSize.sm, marginTop: 2 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.sm },
    taskTitle: { flex: 1, fontSize: FontSize.xxl, fontWeight: '800', lineHeight: 30 },
    taskDesc: { fontSize: FontSize.md, lineHeight: 22, marginTop: Spacing.md },
    detailCard: { marginTop: Spacing.md },
    divider: { height: 1, marginVertical: Spacing.xs },
    sectionLabel: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.8, marginBottom: Spacing.sm },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    tag: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full },
    tagText: { fontSize: FontSize.sm, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
    actionBtn: { flex: 1, paddingVertical: 14, borderRadius: Radius.md, alignItems: 'center' },
    actionBtnText: { fontSize: FontSize.md, fontWeight: '700' },
    bottomSpace: { height: 40 },
});

export default TaskDetailScreen;
