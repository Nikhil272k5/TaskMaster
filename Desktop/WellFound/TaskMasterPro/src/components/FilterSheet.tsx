/**
 * FilterSheet — Bottom sheet modal with filter & sort options
 * Allows filtering by priority, category, deadline, status, and sort mode
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Pressable,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useAppSelector, useAppDispatch } from '../store';
import { setFilters, resetFilters } from '../store/slices/taskSlice';
import { getTheme, Spacing, FontSize, Radius } from '../theme/theme';
import { PRIORITIES, CATEGORIES, SORT_OPTIONS, PRIORITY_CONFIG, CATEGORY_CONFIG } from '../utils/constants';
import { FilterState, Priority, Category, SortMode, DeadlineFilter, StatusFilter } from '../types';

interface FilterSheetProps {
    visible: boolean;
    onClose: () => void;
}

const DEADLINE_OPTIONS: { key: DeadlineFilter; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: '📅' },
    { key: 'today', label: 'Today', icon: '☀️' },
    { key: 'week', label: 'This Week', icon: '📆' },
    { key: 'overdue', label: 'Overdue', icon: '⚠️' },
];

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Done' },
];

const FilterSheet: React.FC<FilterSheetProps> = ({ visible, onClose }) => {
    const dispatch = useAppDispatch();
    const themeMode = useAppSelector((state) => state.theme.mode);
    const filters = useAppSelector((state) => state.tasks.filters);
    const theme = getTheme(themeMode);

    const updateFilter = (update: Partial<FilterState>) => {
        dispatch(setFilters(update));
    };

    const handleReset = () => {
        dispatch(resetFilters());
        onClose();
    };

    const Chip: React.FC<{
        label: string;
        active: boolean;
        color?: string;
        onPress: () => void;
    }> = ({ label, active, color, onPress }) => (
        <TouchableOpacity
            style={[
                styles.chip,
                {
                    backgroundColor: active
                        ? (color ?? theme.colors.accent) + '20'
                        : theme.colors.surface,
                    borderColor: active
                        ? color ?? theme.colors.accent
                        : theme.colors.glassBorder,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text
                style={[
                    styles.chipText,
                    { color: active ? color ?? theme.colors.accent : theme.colors.textMuted },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <Animated.View
                    entering={SlideInDown.springify().damping(20)}
                    style={[styles.sheet, { backgroundColor: theme.colors.background }]}
                >
                    <View style={styles.handle} />

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Sort */}
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                            Sort By
                        </Text>
                        <View style={styles.chipRow}>
                            {SORT_OPTIONS.map((opt) => (
                                <Chip
                                    key={opt.key}
                                    label={`${opt.icon} ${opt.label}`}
                                    active={filters.sortBy === opt.key}
                                    onPress={() => updateFilter({ sortBy: opt.key })}
                                />
                            ))}
                        </View>

                        {/* Priority */}
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                            Priority
                        </Text>
                        <View style={styles.chipRow}>
                            <Chip
                                label="All"
                                active={filters.priority === 'all'}
                                onPress={() => updateFilter({ priority: 'all' })}
                            />
                            {PRIORITIES.map((p) => (
                                <Chip
                                    key={p}
                                    label={`${PRIORITY_CONFIG[p].icon} ${PRIORITY_CONFIG[p].label}`}
                                    active={filters.priority === p}
                                    color={PRIORITY_CONFIG[p].color}
                                    onPress={() => updateFilter({ priority: p })}
                                />
                            ))}
                        </View>

                        {/* Category */}
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                            Category
                        </Text>
                        <View style={styles.chipRow}>
                            <Chip
                                label="🔥 All"
                                active={filters.category === 'all'}
                                onPress={() => updateFilter({ category: 'all' })}
                            />
                            {CATEGORIES.map((c) => (
                                <Chip
                                    key={c}
                                    label={`${CATEGORY_CONFIG[c].icon} ${CATEGORY_CONFIG[c].label}`}
                                    active={filters.category === c}
                                    color={CATEGORY_CONFIG[c].color}
                                    onPress={() => updateFilter({ category: c })}
                                />
                            ))}
                        </View>

                        {/* Deadline */}
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                            Deadline
                        </Text>
                        <View style={styles.chipRow}>
                            {DEADLINE_OPTIONS.map((opt) => (
                                <Chip
                                    key={opt.key}
                                    label={`${opt.icon} ${opt.label}`}
                                    active={filters.deadline === opt.key}
                                    onPress={() => updateFilter({ deadline: opt.key })}
                                />
                            ))}
                        </View>

                        {/* Status */}
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                            Status
                        </Text>
                        <View style={styles.chipRow}>
                            {STATUS_OPTIONS.map((opt) => (
                                <Chip
                                    key={opt.key}
                                    label={opt.label}
                                    active={filters.status === opt.key}
                                    onPress={() => updateFilter({ status: opt.key })}
                                />
                            ))}
                        </View>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.resetBtn, { backgroundColor: theme.colors.surface }]}
                                onPress={handleReset}
                            >
                                <Text style={[styles.resetText, { color: theme.colors.textMuted }]}>
                                    Reset All
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.applyBtn, { backgroundColor: theme.colors.accent }]}
                                onPress={onClose}
                            >
                                <Text style={styles.applyText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    sheet: {
        borderTopLeftRadius: Radius.xxl,
        borderTopRightRadius: Radius.xxl,
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xxxl,
        maxHeight: '80%',
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(128,128,128,0.3)',
        alignSelf: 'center',
        marginVertical: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: '700',
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    chip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    chipText: { fontSize: FontSize.sm, fontWeight: '600' },
    actions: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.xxl,
    },
    resetBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: Radius.md,
        alignItems: 'center',
    },
    resetText: { fontWeight: '600', fontSize: FontSize.md },
    applyBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: Radius.md,
        alignItems: 'center',
    },
    applyText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
});

export default FilterSheet;
