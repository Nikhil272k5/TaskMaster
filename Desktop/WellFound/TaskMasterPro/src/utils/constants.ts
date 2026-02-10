/**
 * Centralized constants — NO magic strings or numbers
 * All labels, configs, and presets live here
 */
import { Priority, Category, SortMode, PriorityUIConfig, CategoryUIConfig } from '../types';

/** Priority UI configurations */
export const PRIORITY_CONFIG: Record<Priority, PriorityUIConfig> = {
    high: {
        label: 'High',
        icon: '🔴',
        color: '#FF6B6B',
        bgColor: 'rgba(255, 107, 107, 0.15)',
        weight: 30,
    },
    medium: {
        label: 'Medium',
        icon: '🟡',
        color: '#FFD93D',
        bgColor: 'rgba(255, 217, 61, 0.15)',
        weight: 20,
    },
    low: {
        label: 'Low',
        icon: '🟢',
        color: '#6BCB77',
        bgColor: 'rgba(107, 203, 119, 0.15)',
        weight: 10,
    },
};

/** Category UI configurations */
export const CATEGORY_CONFIG: Record<Category, CategoryUIConfig> = {
    work: { label: 'Work', icon: '💼', color: '#7C83FD' },
    personal: { label: 'Personal', icon: '👤', color: '#FF6B9D' },
    health: { label: 'Health', icon: '🏥', color: '#4ECDC4' },
    shopping: { label: 'Shopping', icon: '🛒', color: '#FFB84C' },
    finance: { label: 'Finance', icon: '💰', color: '#95E1D3' },
    education: { label: 'Education', icon: '📚', color: '#AA96DA' },
    other: { label: 'Other', icon: '📌', color: '#A8A8A8' },
};

/** Sort mode options for display */
export const SORT_OPTIONS: { key: SortMode; label: string; icon: string }[] = [
    { key: 'smart', label: 'Smart Sort', icon: '🧠' },
    { key: 'deadline', label: 'Deadline', icon: '⏰' },
    { key: 'priority', label: 'Priority', icon: '📊' },
    { key: 'created', label: 'Newest', icon: '🆕' },
];

/** All priority keys for iteration */
export const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

/** All category keys for iteration */
export const CATEGORIES: Category[] = [
    'work', 'personal', 'health', 'shopping', 'finance', 'education', 'other',
];

/** Time thresholds in milliseconds */
export const TIME = {
    ONE_HOUR: 3_600_000,
    ONE_DAY: 86_400_000,
    THREE_DAYS: 259_200_000,
    ONE_WEEK: 604_800_000,
} as const;

/** Sorting weights for smart sort algorithm */
export const SORT_WEIGHTS = {
    COMPLETED_PENALTY: -1000,
    OVERDUE_BONUS: 100,
    DUE_WITHIN_DAY: 50,
    DUE_WITHIN_THREE_DAYS: 25,
    DUE_WITHIN_WEEK: 10,
    RECENCY_BONUS: 5,
} as const;

/** Animation durations in ms */
export const ANIMATION = {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
    SPRING_DAMPING: 15,
    SPRING_STIFFNESS: 150,
} as const;

/** AsyncStorage keys */
export const STORAGE_KEYS = {
    THEME_MODE: '@taskmaster_theme_mode',
} as const;

/** Firestore collection names */
export const COLLECTIONS = {
    USERS: 'users',
    TASKS: 'tasks',
} as const;

/** Validation limits */
export const VALIDATION = {
    MIN_PASSWORD_LENGTH: 6,
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_TAGS: 5,
    MAX_TAG_LENGTH: 20,
} as const;

/** App metadata */
export const APP = {
    NAME: 'TaskMaster Pro',
    VERSION: '1.0.0',
    TAGLINE: 'Organize your life, one task at a time',
} as const;
