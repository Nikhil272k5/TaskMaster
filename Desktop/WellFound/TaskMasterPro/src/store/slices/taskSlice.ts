/**
 * Task Slice — Redux Toolkit
 * Manages tasks: CRUD, sorting, filtering, undo-delete buffer
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, CreateTaskData, UpdateTaskData, FilterState, SnackbarState } from '../../types';
import * as taskService from '../../services/taskService';
import { applyFilters } from '../../utils/helpers';

interface TaskState {
    tasks: Task[];
    filteredTasks: Task[];
    filters: FilterState;
    isLoading: boolean;
    isCreating: boolean;
    error: string | null;
    snackbar: SnackbarState;
}

const defaultFilters: FilterState = {
    priority: 'all',
    status: 'all',
    deadline: 'all',
    category: 'all',
    searchQuery: '',
    sortBy: 'smart',
};

const initialState: TaskState = {
    tasks: [],
    filteredTasks: [],
    filters: defaultFilters,
    isLoading: false,
    isCreating: false,
    error: null,
    snackbar: { visible: false, message: '', taskToUndo: null },
};

/** Fetch all tasks for current user */
export const fetchTasks = createAsyncThunk(
    'tasks/fetchAll',
    async (userId: string, { rejectWithValue }) => {
        try {
            return await taskService.getUserTasks(userId);
        } catch (error: unknown) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to fetch tasks',
            );
        }
    },
);

/** Create a new task */
export const addTask = createAsyncThunk(
    'tasks/add',
    async (
        { userId, data }: { userId: string; data: CreateTaskData },
        { rejectWithValue },
    ) => {
        try {
            return await taskService.createTask(userId, data);
        } catch (error: unknown) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to create task',
            );
        }
    },
);

/** Update an existing task */
export const editTask = createAsyncThunk(
    'tasks/edit',
    async (
        { taskId, data }: { taskId: string; data: UpdateTaskData },
        { rejectWithValue },
    ) => {
        try {
            await taskService.updateTask(taskId, data);
            return { taskId, data };
        } catch (error: unknown) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to update task',
            );
        }
    },
);

/** Delete a task */
export const removeTask = createAsyncThunk(
    'tasks/remove',
    async (taskId: string, { rejectWithValue }) => {
        try {
            await taskService.deleteTask(taskId);
            return taskId;
        } catch (error: unknown) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to delete task',
            );
        }
    },
);

/** Toggle task completion */
export const toggleComplete = createAsyncThunk(
    'tasks/toggle',
    async (
        { taskId, currentStatus }: { taskId: string; currentStatus: boolean },
        { rejectWithValue },
    ) => {
        try {
            const result = await taskService.toggleTaskComplete(taskId, currentStatus);
            return { taskId, ...result };
        } catch (error: unknown) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to toggle task',
            );
        }
    },
);

/** Undo a delete by restoring the task */
export const undoDelete = createAsyncThunk(
    'tasks/undoDelete',
    async (task: Task, { rejectWithValue }) => {
        try {
            await taskService.restoreTask(task);
            return task;
        } catch (error: unknown) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to restore task',
            );
        }
    },
);

/** Helper to recompute filtered tasks */
const recomputeFiltered = (state: TaskState): void => {
    state.filteredTasks = applyFilters(state.tasks, state.filters);
};

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        /** Update filters and recompute */
        setFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
            state.filters = { ...state.filters, ...action.payload };
            recomputeFiltered(state);
        },
        /** Reset all filters */
        resetFilters: (state) => {
            state.filters = defaultFilters;
            recomputeFiltered(state);
        },
        /** Show snackbar with undo option */
        showSnackbar: (
            state,
            action: PayloadAction<{ message: string; task: Task }>,
        ) => {
            state.snackbar = {
                visible: true,
                message: action.payload.message,
                taskToUndo: action.payload.task,
            };
        },
        /** Hide snackbar */
        hideSnackbar: (state) => {
            state.snackbar = { visible: false, message: '', taskToUndo: null };
        },
        /** Clear all tasks (on logout) */
        clearTasks: (state) => {
            state.tasks = [];
            state.filteredTasks = [];
        },
    },
    extraReducers: (builder) => {
        /** Fetch tasks */
        builder
            .addCase(fetchTasks.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.isLoading = false;
                state.tasks = action.payload;
                recomputeFiltered(state);
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        /** Add task */
        builder
            .addCase(addTask.pending, (state) => {
                state.isCreating = true;
            })
            .addCase(addTask.fulfilled, (state, action) => {
                state.isCreating = false;
                state.tasks.unshift(action.payload);
                recomputeFiltered(state);
            })
            .addCase(addTask.rejected, (state, action) => {
                state.isCreating = false;
                state.error = action.payload as string;
            });

        /** Edit task */
        builder.addCase(editTask.fulfilled, (state, action) => {
            const { taskId, data } = action.payload;
            const idx = state.tasks.findIndex((t) => t.id === taskId);
            if (idx !== -1) {
                state.tasks[idx] = { ...state.tasks[idx], ...data, updatedAt: new Date().toISOString() };
                recomputeFiltered(state);
            }
        });

        /** Remove task */
        builder.addCase(removeTask.fulfilled, (state, action) => {
            state.tasks = state.tasks.filter((t) => t.id !== action.payload);
            recomputeFiltered(state);
        });

        /** Toggle complete */
        builder.addCase(toggleComplete.fulfilled, (state, action) => {
            const { taskId, isCompleted, completedAt } = action.payload;
            const idx = state.tasks.findIndex((t) => t.id === taskId);
            if (idx !== -1) {
                state.tasks[idx].isCompleted = isCompleted;
                state.tasks[idx].completedAt = completedAt;
                recomputeFiltered(state);
            }
        });

        /** Undo delete */
        builder.addCase(undoDelete.fulfilled, (state, action) => {
            state.tasks.unshift(action.payload);
            recomputeFiltered(state);
        });
    },
});

export const { setFilters, resetFilters, showSnackbar, hideSnackbar, clearTasks } =
    taskSlice.actions;
export default taskSlice.reducer;
