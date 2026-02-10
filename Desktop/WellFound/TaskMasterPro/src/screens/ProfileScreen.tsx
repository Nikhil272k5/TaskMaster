/**
 * ProfileScreen — User profile, stats dashboard, theme toggle, logout
 */
import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';
import { useAppSelector, useAppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { clearTasks } from '../store/slices/taskSlice';
import { toggleTheme, saveTheme } from '../store/slices/themeSlice';
import { getTheme, Spacing, FontSize, Radius } from '../theme/theme';
import { getTaskAnalytics } from '../utils/helpers';
import { PRIORITY_CONFIG, APP } from '../utils/constants';
import { ThemeMode } from '../types';

const ProfileScreen: React.FC = () => {
    const dispatch = useAppDispatch();
    const themeMode = useAppSelector((state) => state.theme.mode);
    const { user } = useAppSelector((state) => state.auth);
    const { tasks } = useAppSelector((state) => state.tasks);
    const theme = getTheme(themeMode);
    const analytics = getTaskAnalytics(tasks);

    /** Handle theme toggle */
    const handleThemeToggle = () => {
        const newMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
        dispatch(toggleTheme());
        dispatch(saveTheme(newMode));
    };

    /** Handle secure logout */
    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout', style: 'destructive',
                onPress: () => {
                    dispatch(clearTasks());
                    dispatch(logout());
                },
            },
        ]);
    };

    /** Stat card used in the grid */
    const StatCard: React.FC<{ icon: string; value: number | string; label: string; color: string }> = ({
        icon, value, label, color,
    }) => (
        <GlassCard style={styles.statCard}>
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{label}</Text>
        </GlassCard>
    );

    /** Priority breakdown row */
    const PriorityRow: React.FC<{ label: string; count: number; color: string; total: number }> = ({
        label, count, color, total,
    }) => {
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
            <View style={styles.pRow}>
                <Text style={[styles.pLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
                <View style={[styles.pBarBg, { backgroundColor: theme.colors.surface }]}>
                    <View style={[styles.pBar, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
                <Text style={[styles.pCount, { color: theme.colors.textMuted }]}>{count}</Text>
            </View>
        );
    };

    return (
        <AnimatedBackground>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar & Name */}
                <Animated.View entering={FadeIn.duration(500)} style={styles.avatarSection}>
                    <View style={[styles.avatar, { backgroundColor: theme.colors.accent }]}>
                        <Text style={styles.avatarText}>
                            {(user?.displayName ?? 'U').charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
                        {user?.displayName ?? 'User'}
                    </Text>
                    <Text style={[styles.userEmail, { color: theme.colors.textMuted }]}>
                        {user?.email ?? ''}
                    </Text>
                </Animated.View>

                {/* Stats Grid */}
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>📊 Statistics</Text>
                    <View style={styles.statsGrid}>
                        <StatCard icon="📋" value={analytics.total} label="Total" color={theme.colors.accent} />
                        <StatCard icon="✅" value={analytics.completed} label="Done" color={theme.colors.success} />
                        <StatCard icon="⏳" value={analytics.pending} label="Pending" color={theme.colors.warning} />
                        <StatCard icon="📈" value={`${analytics.completionRate}%`} label="Rate" color={theme.colors.info} />
                    </View>
                </Animated.View>

                {/* Priority Breakdown */}
                <Animated.View entering={FadeInDown.delay(200).springify()}>
                    <GlassCard elevated style={styles.breakdownCard}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>🎯 Priority Breakdown</Text>
                        {(['high', 'medium', 'low'] as const).map((p) => (
                            <PriorityRow
                                key={p}
                                label={PRIORITY_CONFIG[p].label}
                                count={tasks.filter((t) => t.priority === p && !t.isCompleted).length}
                                color={PRIORITY_CONFIG[p].color}
                                total={analytics.pending}
                            />
                        ))}
                    </GlassCard>
                </Animated.View>

                {/* Theme Toggle */}
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                    <GlassCard elevated>
                        <TouchableOpacity style={styles.settingRow} onPress={handleThemeToggle}>
                            <Text style={styles.settingIcon}>{themeMode === 'dark' ? '🌙' : '☀️'}</Text>
                            <View style={styles.settingContent}>
                                <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Theme</Text>
                                <Text style={[styles.settingSub, { color: theme.colors.textMuted }]}>
                                    {themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                </Text>
                            </View>
                            <View style={[styles.toggle, { backgroundColor: theme.colors.accent }]}>
                                <View style={[styles.toggleDot, { alignSelf: themeMode === 'dark' ? 'flex-end' : 'flex-start' }]} />
                            </View>
                        </TouchableOpacity>
                    </GlassCard>
                </Animated.View>

                {/* App Info */}
                <Animated.View entering={FadeInDown.delay(400).springify()}>
                    <GlassCard elevated style={styles.infoCard}>
                        <Text style={[styles.appName, { color: theme.colors.textPrimary }]}>{APP.NAME}</Text>
                        <Text style={[styles.appVersion, { color: theme.colors.textMuted }]}>v{APP.VERSION}</Text>
                        <Text style={[styles.appTagline, { color: theme.colors.textMuted }]}>{APP.TAGLINE}</Text>
                    </GlassCard>
                </Animated.View>

                {/* Logout */}
                <TouchableOpacity
                    style={[styles.logoutBtn, { backgroundColor: theme.colors.error + '15' }]}
                    onPress={handleLogout}
                >
                    <Text style={[styles.logoutText, { color: theme.colors.error }]}>🚪 Sign Out</Text>
                </TouchableOpacity>

                <View style={styles.bottomSpace} />
            </ScrollView>
        </AnimatedBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 52 },
    content: { paddingHorizontal: Spacing.xl },
    avatarSection: { alignItems: 'center', marginBottom: Spacing.xxl },
    avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
    avatarText: { fontSize: FontSize.xxxl, fontWeight: '800', color: '#fff' },
    userName: { fontSize: FontSize.xxl, fontWeight: '800' },
    userEmail: { fontSize: FontSize.md, marginTop: Spacing.xs },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
    statCard: { width: '47%', flexGrow: 1, alignItems: 'center', paddingVertical: Spacing.md },
    statIcon: { fontSize: 24, marginBottom: Spacing.xs },
    statValue: { fontSize: FontSize.xxl, fontWeight: '800' },
    statLabel: { fontSize: FontSize.xs, fontWeight: '600', marginTop: 2 },
    breakdownCard: { marginBottom: Spacing.lg },
    pRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
    pLabel: { width: 65, fontSize: FontSize.sm, fontWeight: '600' },
    pBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
    pBar: { height: 8, borderRadius: 4 },
    pCount: { width: 24, textAlign: 'right', fontSize: FontSize.sm, fontWeight: '600' },
    settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    settingIcon: { fontSize: 28 },
    settingContent: { flex: 1 },
    settingLabel: { fontSize: FontSize.lg, fontWeight: '600' },
    settingSub: { fontSize: FontSize.sm, marginTop: 2 },
    toggle: { width: 48, height: 28, borderRadius: 14, justifyContent: 'center', paddingHorizontal: 3 },
    toggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
    infoCard: { alignItems: 'center', marginTop: Spacing.md },
    appName: { fontSize: FontSize.lg, fontWeight: '800' },
    appVersion: { fontSize: FontSize.sm, marginTop: 2 },
    appTagline: { fontSize: FontSize.sm, marginTop: Spacing.xs, textAlign: 'center' },
    logoutBtn: { paddingVertical: 16, borderRadius: Radius.md, alignItems: 'center', marginTop: Spacing.xl },
    logoutText: { fontSize: FontSize.lg, fontWeight: '700' },
    bottomSpace: { height: 100 },
});

export default ProfileScreen;
