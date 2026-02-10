/**
 * SnackBar — Undo delete toast notification
 * Appears at the bottom when a task is deleted, with an undo action
 * Auto-dismisses after 4 seconds
 */
import React, { useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useAppSelector, useAppDispatch } from '../store';
import { hideSnackbar, undoDelete } from '../store/slices/taskSlice';
import { getTheme, Spacing, FontSize, Radius } from '../theme/theme';

/** Auto-dismiss timeout in ms */
const DISMISS_TIMEOUT = 4000;

const SnackBar: React.FC = () => {
    const dispatch = useAppDispatch();
    const themeMode = useAppSelector((state) => state.theme.mode);
    const { visible, message, taskToUndo } = useAppSelector(
        (state) => state.tasks.snackbar,
    );
    const theme = getTheme(themeMode);

    /** Auto-dismiss after timeout */
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                dispatch(hideSnackbar());
            }, DISMISS_TIMEOUT);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [visible, dispatch]);

    /** Handle undo — restore the deleted task */
    const handleUndo = () => {
        if (taskToUndo) {
            dispatch(undoDelete(taskToUndo));
        }
        dispatch(hideSnackbar());
    };

    if (!visible) return null;

    return (
        <Animated.View
            entering={SlideInDown.springify().damping(20)}
            exiting={SlideOutDown.duration(200)}
            style={[
                styles.container,
                { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.glassBorder },
            ]}
        >
            <Text style={[styles.message, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {message}
            </Text>
            {taskToUndo && (
                <TouchableOpacity onPress={handleUndo} style={styles.undoBtn}>
                    <Text style={[styles.undoText, { color: theme.colors.accent }]}>UNDO</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 90,
        left: Spacing.lg,
        right: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: Radius.md,
        borderWidth: 1,
        zIndex: 999,
    },
    message: { flex: 1, fontSize: FontSize.md, fontWeight: '500' },
    undoBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
    undoText: { fontSize: FontSize.md, fontWeight: '800', letterSpacing: 0.5 },
});

export default SnackBar;
