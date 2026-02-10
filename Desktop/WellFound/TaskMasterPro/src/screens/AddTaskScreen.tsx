/**
 * AddTaskScreen — Create or Edit a task
 * Features: title, description, deadline picker, priority selector,
 * category grid, tags input, full validation
 */
import React, { useState, useCallback } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    ScrollView, StatusBar, ActivityIndicator, Alert, Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';
import { useAppSelector, useAppDispatch } from '../store';
import { addTask, editTask } from '../store/slices/taskSlice';
import { getTheme, Spacing, FontSize, Radius } from '../theme/theme';
import {
    PRIORITIES, CATEGORIES, PRIORITY_CONFIG, CATEGORY_CONFIG,
    VALIDATION,
} from '../utils/constants';
import { formatDateTime } from '../utils/helpers';
import { Task, Priority, Category, CreateTaskData } from '../types';

interface AddTaskScreenProps {
    navigation: { goBack: () => void };
    route: { params?: { task?: Task } };
}

const AddTaskScreen: React.FC<AddTaskScreenProps> = ({ navigation, route }) => {
    const existingTask = route.params?.task;
    const isEdit = !!existingTask;

    const dispatch = useAppDispatch();
    const themeMode = useAppSelector((state) => state.theme.mode);
    const { user } = useAppSelector((state) => state.auth);
    const { isCreating } = useAppSelector((state) => state.tasks);
    const theme = getTheme(themeMode);

    /** Form state */
    const [title, setTitle] = useState(existingTask?.title ?? '');
    const [description, setDescription] = useState(existingTask?.description ?? '');
    const [deadline, setDeadline] = useState(
        existingTask ? new Date(existingTask.deadline) : new Date(Date.now() + 86_400_000),
    );
    const [priority, setPriority] = useState<Priority>(existingTask?.priority ?? 'medium');
    const [category, setCategory] = useState<Category>(existingTask?.category ?? 'personal');
    const [tagsInput, setTagsInput] = useState(existingTask?.tags.join(', ') ?? '');

    /** Date picker state */
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    /** Validation errors */
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!title.trim()) e.title = 'Title is required';
        else if (title.length > VALIDATION.MAX_TITLE_LENGTH)
            e.title = `Max ${VALIDATION.MAX_TITLE_LENGTH} characters`;
        if (description.length > VALIDATION.MAX_DESCRIPTION_LENGTH)
            e.description = `Max ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters`;
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = useCallback(async () => {
        if (!validate() || !user) return;

        const tags = tagsInput
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter((t) => t.length > 0)
            .slice(0, VALIDATION.MAX_TAGS);

        const data: CreateTaskData = {
            title: title.trim(),
            description: description.trim(),
            deadline: deadline.toISOString(),
            priority,
            category,
            tags,
        };

        if (isEdit && existingTask) {
            await dispatch(editTask({ taskId: existingTask.id, data }));
        } else {
            await dispatch(addTask({ userId: user.uid, data }));
        }

        navigation.goBack();
    }, [dispatch, user, title, description, deadline, priority, category, tagsInput, isEdit, existingTask, navigation]);

    const onDateChange = (_event: unknown, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const newDeadline = new Date(deadline);
            newDeadline.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            setDeadline(newDeadline);
        }
    };

    const onTimeChange = (_event: unknown, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            const newDeadline = new Date(deadline);
            newDeadline.setHours(selectedTime.getHours(), selectedTime.getMinutes());
            setDeadline(newDeadline);
        }
    };

    return (
        <AnimatedBackground>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
            <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={[styles.backIcon, { color: theme.colors.textPrimary }]}>←</Text>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                        {isEdit ? 'Edit Task' : 'New Task'}
                    </Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Title */}
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <GlassCard style={styles.section} elevated>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>TITLE</Text>
                        <TextInput
                            style={[styles.input, { color: theme.colors.textPrimary, backgroundColor: theme.colors.inputBackground, borderColor: errors.title ? theme.colors.error : theme.colors.inputBorder }]}
                            placeholder="What needs to be done?"
                            placeholderTextColor={theme.colors.placeholder}
                            value={title}
                            onChangeText={setTitle}
                            maxLength={VALIDATION.MAX_TITLE_LENGTH}
                        />
                        {errors.title && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.title}</Text>}

                        <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: Spacing.md }]}>DESCRIPTION</Text>
                        <TextInput
                            style={[styles.input, styles.multiline, { color: theme.colors.textPrimary, backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder }]}
                            placeholder="Add details..."
                            placeholderTextColor={theme.colors.placeholder}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            maxLength={VALIDATION.MAX_DESCRIPTION_LENGTH}
                        />
                    </GlassCard>
                </Animated.View>

                {/* Deadline */}
                <Animated.View entering={FadeInDown.delay(200).springify()}>
                    <GlassCard style={styles.section} elevated>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>📅 DEADLINE</Text>
                        <View style={styles.dateRow}>
                            <TouchableOpacity
                                style={[styles.dateBtn, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder }]}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={[styles.dateBtnText, { color: theme.colors.textPrimary }]}>
                                    {formatDateTime(deadline.toISOString())}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.timeBtn, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder }]}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Text style={[styles.dateBtnText, { color: theme.colors.textPrimary }]}>⏰</Text>
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                </Animated.View>

                {showDatePicker && (
                    <DateTimePicker value={deadline} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} minimumDate={new Date()} />
                )}
                {showTimePicker && (
                    <DateTimePicker value={deadline} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onTimeChange} />
                )}

                {/* Priority */}
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                    <GlassCard style={styles.section} elevated>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>🎯 PRIORITY</Text>
                        <View style={styles.chipRow}>
                            {PRIORITIES.map((p) => {
                                const cfg = PRIORITY_CONFIG[p];
                                const isActive = priority === p;
                                return (
                                    <TouchableOpacity
                                        key={p}
                                        style={[styles.chip, { backgroundColor: isActive ? cfg.color + '25' : theme.colors.surface, borderColor: isActive ? cfg.color : theme.colors.glassBorder }]}
                                        onPress={() => setPriority(p)}
                                    >
                                        <Text style={styles.chipIcon}>{cfg.icon}</Text>
                                        <Text style={[styles.chipLabel, { color: isActive ? cfg.color : theme.colors.textMuted }]}>{cfg.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* Category */}
                <Animated.View entering={FadeInDown.delay(400).springify()}>
                    <GlassCard style={styles.section} elevated>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>📂 CATEGORY</Text>
                        <View style={styles.categoryGrid}>
                            {CATEGORIES.map((c) => {
                                const cfg = CATEGORY_CONFIG[c];
                                const isActive = category === c;
                                return (
                                    <TouchableOpacity
                                        key={c}
                                        style={[styles.categoryChip, { backgroundColor: isActive ? cfg.color + '20' : theme.colors.surface, borderColor: isActive ? cfg.color : 'transparent' }]}
                                        onPress={() => setCategory(c)}
                                    >
                                        <Text style={styles.categoryIcon}>{cfg.icon}</Text>
                                        <Text style={[styles.categoryLabel, { color: isActive ? cfg.color : theme.colors.textMuted }]}>{cfg.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* Tags */}
                <Animated.View entering={FadeInDown.delay(500).springify()}>
                    <GlassCard style={styles.section} elevated>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>🏷️ TAGS (comma separated)</Text>
                        <TextInput
                            style={[styles.input, { color: theme.colors.textPrimary, backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder }]}
                            placeholder="e.g., urgent, meeting, design"
                            placeholderTextColor={theme.colors.placeholder}
                            value={tagsInput}
                            onChangeText={setTagsInput}
                        />
                    </GlassCard>
                </Animated.View>

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: theme.colors.accent }]}
                    onPress={handleSubmit}
                    disabled={isCreating}
                    activeOpacity={0.8}
                >
                    {isCreating ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitText}>{isEdit ? 'Update Task' : '✨ Create Task'}</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.bottomSpace} />
            </ScrollView>
        </AnimatedBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 52 },
    content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    backIcon: { fontSize: 24, fontWeight: '700' },
    headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: '700', textAlign: 'center' },
    placeholder: { width: 40 },
    section: { marginBottom: Spacing.md },
    label: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.8, marginBottom: Spacing.sm },
    input: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: FontSize.md },
    multiline: { minHeight: 80, textAlignVertical: 'top' },
    errorText: { fontSize: FontSize.xs, marginTop: Spacing.xs, fontWeight: '500' },
    dateRow: { flexDirection: 'row', gap: Spacing.sm },
    dateBtn: { flex: 1, borderWidth: 1, borderRadius: Radius.md, paddingVertical: 12, paddingHorizontal: Spacing.md },
    timeBtn: { borderWidth: 1, borderRadius: Radius.md, paddingVertical: 12, paddingHorizontal: Spacing.lg },
    dateBtnText: { fontSize: FontSize.md, textAlign: 'center' },
    chipRow: { flexDirection: 'row', gap: Spacing.sm },
    chip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1.5, gap: 4 },
    chipIcon: { fontSize: 12 },
    chipLabel: { fontSize: FontSize.sm, fontWeight: '700' },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    categoryChip: { width: '30%', flexGrow: 1, alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1.5, gap: 4 },
    categoryIcon: { fontSize: 20 },
    categoryLabel: { fontSize: FontSize.xs, fontWeight: '600' },
    submitBtn: { paddingVertical: 16, borderRadius: Radius.md, alignItems: 'center', marginTop: Spacing.md },
    submitText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '700', letterSpacing: 0.5 },
    bottomSpace: { height: 40 },
});

export default AddTaskScreen;
