/**
 * Theme Slice — Redux Toolkit
 * Manages dark/light mode with AsyncStorage persistence
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../../types';
import { STORAGE_KEYS } from '../../utils/constants';

interface ThemeState {
    mode: ThemeMode;
    isLoaded: boolean;
}

const initialState: ThemeState = {
    mode: 'dark',
    isLoaded: false,
};

/** Load saved theme preference from AsyncStorage */
export const loadTheme = createAsyncThunk('theme/load', async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
    return (saved as ThemeMode) ?? 'dark';
});

/** Save theme preference to AsyncStorage */
export const saveTheme = createAsyncThunk(
    'theme/save',
    async (mode: ThemeMode) => {
        await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
        return mode;
    },
);

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        /** Toggle between dark and light */
        toggleTheme: (state) => {
            state.mode = state.mode === 'dark' ? 'light' : 'dark';
        },
        /** Set a specific theme mode */
        setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
            state.mode = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loadTheme.fulfilled, (state, action) => {
            state.mode = action.payload;
            state.isLoaded = true;
        });
        builder.addCase(saveTheme.fulfilled, (state, action) => {
            state.mode = action.payload;
        });
    },
});

export const { toggleTheme, setThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
