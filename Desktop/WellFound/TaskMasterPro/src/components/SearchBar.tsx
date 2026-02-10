/**
 * SearchBar — Animated search input with expand/collapse animation
 */
import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { useAppSelector, useAppDispatch } from '../store';
import { setFilters } from '../store/slices/taskSlice';
import { getTheme, Spacing, FontSize, Radius } from '../theme/theme';
import { ANIMATION } from '../utils/constants';
import { Text } from 'react-native';

interface SearchBarProps {
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search tasks...' }) => {
    const dispatch = useAppDispatch();
    const themeMode = useAppSelector((state) => state.theme.mode);
    const searchQuery = useAppSelector((state) => state.tasks.filters.searchQuery);
    const theme = getTheme(themeMode);
    const inputRef = useRef<TextInput>(null);

    const handleChange = (text: string) => {
        dispatch(setFilters({ searchQuery: text }));
    };

    const handleClear = () => {
        dispatch(setFilters({ searchQuery: '' }));
        inputRef.current?.blur();
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.glass,
                    borderColor: theme.colors.glassBorder,
                },
            ]}
        >
            <Text style={styles.icon}>🔍</Text>
            <TextInput
                ref={inputRef}
                style={[styles.input, { color: theme.colors.textPrimary }]}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.placeholder}
                value={searchQuery}
                onChangeText={handleChange}
                returnKeyType="search"
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                    <Text style={[styles.clearIcon, { color: theme.colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Radius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        height: 44,
    },
    icon: { fontSize: 16, marginRight: Spacing.sm },
    input: {
        flex: 1,
        fontSize: FontSize.md,
        paddingVertical: 0,
    },
    clearBtn: { padding: Spacing.xs },
    clearIcon: { fontSize: 14, fontWeight: '700' },
});

export default SearchBar;
