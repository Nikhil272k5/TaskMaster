/**
 * Utility helpers
 * Pure functions for date formatting, validation, sorting, and analytics
 */
import { Task, FilterState, TaskAnalytics, Priority } from '../types';
import {
    PRIORITY_CONFIG,
    TIME,
    SORT_WEIGHTS,
    VALIDATION,
} from './constants';

// ─── Date Helpers ───────────────────────────────────────────────────

/** Format ISO string to readable date-time */
export const formatDateTime = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

/** Format ISO string to short date */
export const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/** Get relative time string (e.g. "2h ago", "in 3d") */
export const getRelativeTime = (iso: string): string => {
    const now = Date.now();
    const target = new Date(iso).getTime();
    const diff = target - now;
    const absDiff = Math.abs(diff);
    const isPast = diff < 0;

    if (absDiff < TIME.ONE_HOUR) {
        const mins = Math.round(absDiff / 60_000);
        return isPast ? `${mins}m ago` : `in ${mins}m`;
    }
    if (absDiff < TIME.ONE_DAY) {
        const hrs = Math.round(absDiff / TIME.ONE_HOUR);
        return isPast ? `${hrs}h ago` : `in ${hrs}h`;
    }
    const days = Math.round(absDiff / TIME.ONE_DAY);
    return isPast ? `${days}d ago` : `in ${days}d`;
};

/** Check if a deadline is overdue */
export const isOverdue = (deadline: string): boolean =>
    new Date(deadline).getTime() < Date.now();

/** Check if deadline is within 24 hours */
export const isDueSoon = (deadline: string): boolean => {
    const diff = new Date(deadline).getTime() - Date.now();
    return diff > 0 && diff < TIME.ONE_DAY;
};

/** Check if date is today */
export const isToday = (iso: string): boolean => {
    const d = new Date(iso);
    const now = new Date();
    return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
    );
};

/** Check if date is within this week */
export const isThisWeek = (iso: string): boolean => {
    const diff = new Date(iso).getTime() - Date.now();
    return diff > 0 && diff < TIME.ONE_WEEK;
};

// ─── Greeting ───────────────────────────────────────────────────────

/** Get time-based greeting */
export const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

// ─── Validation ─────────────────────────────────────────────────────

/** Validate email format */
export const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** Validate password strength */
export const isValidPassword = (password: string): boolean =>
    password.length >= VALIDATION.MIN_PASSWORD_LENGTH;

// ─── Smart Sorting Algorithm ────────────────────────────────────────

/**
 * SMART SORT ALGORITHM
 *
 * Multi-factor scoring system that balances urgency, importance, and recency:
 *
 * Score Breakdown:
 * 1. Completion Status:  completed tasks → -1000 (pushed to bottom)
 * 2. Overdue Urgency:    past deadline   → +100
 * 3. Deadline Proximity: <24h → +50, <3d → +25, <7d → +10
 * 4. Priority Weight:    high → +30, medium → +20, low → +10
 * 5. Recency Bonus:      recently created → +5 (tiebreaker)
 *
 * Tasks are sorted descending by total score.
 * This ensures overdue high-priority tasks always surface first,
 * while completed tasks always sink to the bottom.
 */
export const calculateSmartScore = (task: Task): number => {
    let score = 0;
    const now = Date.now();
    const deadline = new Date(task.deadline).getTime();
    const timeToDeadline = deadline - now;

    /** Step 1: Penalize completed tasks */
    if (task.isCompleted) {
        return SORT_WEIGHTS.COMPLETED_PENALTY;
    }

    /** Step 2: Urgency from overdue status */
    if (timeToDeadline < 0) {
        score += SORT_WEIGHTS.OVERDUE_BONUS;
    }

    /** Step 3: Deadline proximity bonuses */
    if (timeToDeadline > 0 && timeToDeadline < TIME.ONE_DAY) {
        score += SORT_WEIGHTS.DUE_WITHIN_DAY;
    } else if (timeToDeadline > 0 && timeToDeadline < TIME.THREE_DAYS) {
        score += SORT_WEIGHTS.DUE_WITHIN_THREE_DAYS;
    } else if (timeToDeadline > 0 && timeToDeadline < TIME.ONE_WEEK) {
        score += SORT_WEIGHTS.DUE_WITHIN_WEEK;
    }

    /** Step 4: Priority weight */
    score += PRIORITY_CONFIG[task.priority].weight;

    /** Step 5: Recency tiebreaker */
    const ageHours = (now - new Date(task.createdAt).getTime()) / TIME.ONE_HOUR;
    if (ageHours < 24) {
        score += SORT_WEIGHTS.RECENCY_BONUS;
    }

    return score;
};

/** Sort tasks using the smart algorithm */
export const smartSort = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => calculateSmartScore(b) - calculateSmartScore(a));
};

/** Sort by deadline (nearest first, completed last) */
export const sortByDeadline = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
};

/** Sort by priority (high → low, completed last) */
export const sortByPriority = (tasks: Task[]): Task[] => {
    const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    return [...tasks].sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return order[a.priority] - order[b.priority];
    });
};

/** Sort by creation date (newest first) */
export const sortByCreated = (tasks: Task[]): Task[] => {
    return [...tasks].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
};

/** Apply the selected sort mode */
export const applySort = (tasks: Task[], mode: string): Task[] => {
    switch (mode) {
        case 'smart': return smartSort(tasks);
        case 'deadline': return sortByDeadline(tasks);
        case 'priority': return sortByPriority(tasks);
        case 'created': return sortByCreated(tasks);
        default: return smartSort(tasks);
    }
};

// ─── Filtering ──────────────────────────────────────────────────────

/** Apply all active filters to task list */
export const applyFilters = (tasks: Task[], filters: FilterState): Task[] => {
    let result = [...tasks];

    /** Filter by priority */
    if (filters.priority !== 'all') {
        result = result.filter((t) => t.priority === filters.priority);
    }

    /** Filter by completion status */
    if (filters.status === 'pending') {
        result = result.filter((t) => !t.isCompleted);
    } else if (filters.status === 'completed') {
        result = result.filter((t) => t.isCompleted);
    }

    /** Filter by deadline preset */
    if (filters.deadline === 'today') {
        result = result.filter((t) => isToday(t.deadline));
    } else if (filters.deadline === 'week') {
        result = result.filter((t) => isThisWeek(t.deadline));
    } else if (filters.deadline === 'overdue') {
        result = result.filter((t) => !t.isCompleted && isOverdue(t.deadline));
    }

    /** Filter by category */
    if (filters.category !== 'all') {
        result = result.filter((t) => t.category === filters.category);
    }

    /** Filter by search query */
    if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        result = result.filter(
            (t) =>
                t.title.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.tags.some((tag) => tag.toLowerCase().includes(q)),
        );
    }

    /** Apply sort */
    return applySort(result, filters.sortBy);
};

// ─── Analytics ──────────────────────────────────────────────────────

/** Calculate task analytics summary */
export const getTaskAnalytics = (tasks: Task[]): TaskAnalytics => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const pending = total - completed;
    const overdue = tasks.filter(
        (t) => !t.isCompleted && isOverdue(t.deadline),
    ).length;
    const completedToday = tasks.filter(
        (t) => t.isCompleted && t.completedAt && isToday(t.completedAt),
    ).length;
    const highPriority = tasks.filter(
        (t) => !t.isCompleted && t.priority === 'high',
    ).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, overdue, completedToday, highPriority, completionRate };
};

/** Truncate text to max length */
export const truncate = (text: string, maxLength: number): string =>
    text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
