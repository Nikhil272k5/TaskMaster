/**
 * Redux Store Configuration
 * Combines auth, tasks, and theme slices
 * Exports typed hooks for dispatch and selector
 */
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import themeReducer from './slices/themeSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        tasks: taskReducer,
        theme: themeReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

/** Root state type inferred from the store */
export type RootState = ReturnType<typeof store.getState>;

/** Dispatch type inferred from the store */
export type AppDispatch = typeof store.dispatch;

/** Typed useDispatch hook */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** Typed useSelector hook */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
