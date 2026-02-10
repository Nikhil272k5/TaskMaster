/**
 * TaskListScreen — Main task dashboard
 * Features: greeting, analytics stats, search, filter button,
 * animated task list with pull-to-refresh, skeleton loaders, FAB
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    StatusBar, RefreshControl,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import AnimatedBackground from '../components/AnimatedBackground';
import AnimatedTaskCard from '../components/AnimatedTaskCard';
import FAB from '../components/FAB';
import SearchBar from '../components/SearchBar';
import SnackBar from '../components/SnackBar';
import FilterSheet from '../components/FilterSheet';
import EmptyState from '../components/EmptyState';
import SkeletonLoader from '../components/SkeletonLoader';
import GlassCard from '../components/GlassCard';
import { useAppSelector, useAppDispatch } from '../store';
import { fetchTasks } from '../store/slices/taskSlice';
import { getTheme, Spacing, FontSize, Radius } from '../theme/theme';
import { getGreeting, getTaskAnalytics } from '../utils/helpers';
import { Task, TaskAnalytics } from '../types';

interface TaskListScreenProps {
    navigation: { navigate: (screen: string, params?: Record<string, unknown>) => void };
}

const TaskListScreen: React.FC<TaskListScreenProps> = ({ navigation }) => {
    const dispatch = useAppDispatch();
    const themeMode = useAppSelector((state) => state.theme.mode);
    const { user } = useAppSelector((state) => state.auth);
    const { filteredTasks, tasks, isLoading } = useAppSelector((state) => state.tasks);
    const theme = getTheme(themeMode);

    const [filterVisible, setFilterVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const analytics: TaskAnalytics = getTaskAnalytics(tasks);

    /** Load tasks on mount */
    useEffect(() => {
        if (user) {
            dispatch(fetchTasks(user.uid));
        }
    }, [dispatch, user]);

    /** Pull-to-refresh handler */
    const onRefresh = useCallback(async () => {
        if (user) {
            setRefreshing(true);
            await dispatch(fetchTasks(user.uid));
            setRefreshing(false);
        }
    }, [dispatch, user]);

    /** Navigate to task detail */
    const handleTaskPress = (taskId: string) => {
        navigation.navigate('TaskDetail', { taskId });
    };

    /** Render a single task card */
    const renderTask = ({ item, index }: { item: Task; index: number }) => (
        <AnimatedTaskCard task={item} index={index} onPress={handleTaskPress} />
    );

    /** Stats pill component */
    const StatPill: React.FC<{ icon: string; value: number; label: string; color: string }> = ({
        icon, value, label, color,
    }) => (
        <View style={[styles.stat, { backgroundColor: color + '15' }]}>
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{label}</Text>
        </View>
    );

    return (
        <AnimatedBackground>
            <StatusBar
                barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />
            <View style={styles.container}>
                {/* Header */}
                <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: theme.colors.textMuted }]}>
                            {getGreeting()} 👋
                        </Text>
                        <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
                            {user?.displayName ?? 'User'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.filterBtn, { backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder }]}
                        onPress={() => setFilterVisible(true)}
                    >
                        <Text style={styles.filterIcon}>⚡</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Stats Row */}
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <View style={styles.statsRow}>
                        <StatPill icon="📋" value={analytics.pending} label="Pending" color="#7C83FD" />
                        <StatPill icon="✅" value={analytics.completedToday} label="Today" color="#6BCB77" />
                        <StatPill icon="⚠️" value={analytics.overdue} label="Overdue" color="#FF6B6B" />
                        <StatPill icon="🔥" value={analytics.highPriority} label="Urgent" color="#FFD93D" />
                    </View>
                </Animated.View>

                {/* Search */}
                <Animated.View entering={FadeInDown.delay(200)} style={styles.searchWrap}>
                    <SearchBar />
                </Animated.View>

                {/* Task List */}
                {isLoading && !refreshing ? (
                    <SkeletonLoader />
                ) : filteredTasks.length === 0 ? (
                    <EmptyState />
                ) : (
                    <FlatList
                        data={filteredTasks}
                        renderItem={renderTask}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={theme.colors.accent}
                                colors={[theme.colors.accent]}
                            />
                        }
                    />
                )}

                {/* FAB */}
                <FAB onPress={() => navigation.navigate('AddTask')} />

                {/* Snackbar (undo delete) */}
                <SnackBar />

                {/* Filter Sheet */}
                <FilterSheet visible={filterVisible} onClose={() => setFilterVisible(false)} />
            </View>
        </AnimatedBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 52 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
    },
    greeting: { fontSize: FontSize.md },
    userName: { fontSize: FontSize.xxl, fontWeight: '800' },
    filterBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    filterIcon: { fontSize: 22 },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.xl,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    stat: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderRadius: Radius.md,
        gap: 2,
    },
    statIcon: { fontSize: 16 },
    statValue: { fontSize: FontSize.xl, fontWeight: '800' },
    statLabel: { fontSize: FontSize.xs, fontWeight: '600' },
    searchWrap: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
    listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
});

export default TaskListScreen;
