/**
 * Centralized TypeScript type definitions
 * All types are strict — no 'any' allowed
 */

/** Task priority levels */
export type Priority = 'low' | 'medium' | 'high';

/** Task categories for organization */
export type Category =
    | 'work'
    | 'personal'
    | 'health'
    | 'shopping'
    | 'finance'
    | 'education'
    | 'other';

/** Theme mode for dark/light switch */
export type ThemeMode = 'dark' | 'light';

/** Sort modes for task list */
export type SortMode = 'smart' | 'deadline' | 'priority' | 'created';

/** Deadline filter presets */
export type DeadlineFilter = 'all' | 'today' | 'week' | 'overdue';

/** Completion status filter */
export type StatusFilter = 'all' | 'pending' | 'completed';

/** Core Task interface — stored in Firestore */
export interface Task {
    id: string;
    userId: string;
    title: string;
    description: string;
    createdAt: string;
    deadline: string;
    priority: Priority;
    category: Category;
    tags: string[];
    isCompleted: boolean;
    completedAt: string | null;
    updatedAt: string;
}

/** Data for creating a new task (no id/userId — set by service) */
export interface CreateTaskData {
    title: string;
    description: string;
    deadline: string;
    priority: Priority;
    category: Category;
    tags: string[];
}

/** Data for updating an existing task */
export interface UpdateTaskData extends Partial<CreateTaskData> {
    isCompleted?: boolean;
    completedAt?: string | null;
}

/** Authenticated user profile */
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    createdAt: string;
}

/** Auth form data for login */
export interface LoginFormData {
    email: string;
    password: string;
}

/** Auth form data for registration */
export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

/** Filter state used in TaskList */
export interface FilterState {
    priority: Priority | 'all';
    status: StatusFilter;
    deadline: DeadlineFilter;
    category: Category | 'all';
    searchQuery: string;
    sortBy: SortMode;
}

/** Task analytics summary */
export interface TaskAnalytics {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completedToday: number;
    highPriority: number;
    completionRate: number;
}

/** Snackbar state for undo actions */
export interface SnackbarState {
    visible: boolean;
    message: string;
    taskToUndo: Task | null;
}

/** Navigation param lists */
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type MainTabParamList = {
    TaskList: undefined;
    AddTask: { task?: Task } | undefined;
    Profile: undefined;
};

export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
    TaskDetail: { taskId: string };
    EditTask: { task: Task };
};

/** Priority config for UI rendering */
export interface PriorityUIConfig {
    label: string;
    icon: string;
    color: string;
    bgColor: string;
    weight: number;
}

/** Category config for UI rendering */
export interface CategoryUIConfig {
    label: string;
    icon: string;
    color: string;
}
