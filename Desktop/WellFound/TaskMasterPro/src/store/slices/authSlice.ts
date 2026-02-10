/**
 * Auth Slice — Redux Toolkit
 * Manages authentication state: login, register, logout, session restore
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../../types';
import * as authService from '../../services/authService';

interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isRestoringSession: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isRestoringSession: true,
    error: null,
};

/** Register a new user */
export const register = createAsyncThunk(
    'auth/register',
    async (
        { email, password, name }: { email: string; password: string; name: string },
        { rejectWithValue },
    ) => {
        try {
            const user = await authService.registerUser(email, password, name);
            return user;
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'Registration failed';
            return rejectWithValue(message);
        }
    },
);

/** Login an existing user */
export const login = createAsyncThunk(
    'auth/login',
    async (
        { email, password }: { email: string; password: string },
        { rejectWithValue },
    ) => {
        try {
            const user = await authService.loginUser(email, password);
            return user;
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'Login failed';
            return rejectWithValue(message);
        }
    },
);

/** Logout current user */
export const logout = createAsyncThunk('auth/logout', async () => {
    await authService.logoutUser();
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /** Set user from auth state listener */
        setUser: (state, action: PayloadAction<UserProfile | null>) => {
            state.user = action.payload;
            state.isAuthenticated = action.payload !== null;
            state.isRestoringSession = false;
        },
        /** Clear any auth errors */
        clearError: (state) => {
            state.error = null;
        },
        /** Mark session restoration as complete */
        sessionRestored: (state) => {
            state.isRestoringSession = false;
        },
    },
    extraReducers: (builder) => {
        /** Register */
        builder
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        /** Login */
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        /** Logout */
        builder
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
            });
    },
});

export const { setUser, clearError, sessionRestored } = authSlice.actions;
export default authSlice.reducer;
