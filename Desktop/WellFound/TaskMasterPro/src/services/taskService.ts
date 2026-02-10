/**
 * Task Service
 * Handles all Firestore CRUD operations for tasks
 * All tasks are scoped to the authenticated user
 */
import { db } from './firebase';
import { COLLECTIONS } from '../utils/constants';
import { Task, CreateTaskData, UpdateTaskData } from '../types';

/** Reference to the tasks collection */
const tasksCollection = () => db.collection(COLLECTIONS.TASKS);

/**
 * Fetch all tasks for a specific user
 * Ordered by creation date descending
 */
export const getUserTasks = async (userId: string): Promise<Task[]> => {
    const snapshot = await tasksCollection()
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Task[];
};

/**
 * Create a new task in Firestore
 * Automatically sets createdAt, updatedAt, and initial completion state
 */
export const createTask = async (
    userId: string,
    data: CreateTaskData,
): Promise<Task> => {
    const now = new Date().toISOString();

    const taskData = {
        userId,
        title: data.title,
        description: data.description,
        deadline: data.deadline,
        priority: data.priority,
        category: data.category,
        tags: data.tags,
        isCompleted: false,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
    };

    const docRef = await tasksCollection().add(taskData);

    return {
        id: docRef.id,
        ...taskData,
    };
};

/**
 * Update an existing task
 * Automatically bumps updatedAt timestamp
 */
export const updateTask = async (
    taskId: string,
    data: UpdateTaskData,
): Promise<void> => {
    await tasksCollection().doc(taskId).update({
        ...data,
        updatedAt: new Date().toISOString(),
    });
};

/**
 * Delete a task from Firestore
 */
export const deleteTask = async (taskId: string): Promise<void> => {
    await tasksCollection().doc(taskId).delete();
};

/**
 * Toggle task completion status
 * Sets completedAt when completing, clears it when uncompleting
 */
export const toggleTaskComplete = async (
    taskId: string,
    currentStatus: boolean,
): Promise<{ isCompleted: boolean; completedAt: string | null }> => {
    const newStatus = !currentStatus;
    const completedAt = newStatus ? new Date().toISOString() : null;

    await tasksCollection().doc(taskId).update({
        isCompleted: newStatus,
        completedAt,
        updatedAt: new Date().toISOString(),
    });

    return { isCompleted: newStatus, completedAt };
};

/**
 * Re-add a previously deleted task (for undo functionality)
 * Preserves the original task data including its ID
 */
export const restoreTask = async (task: Task): Promise<void> => {
    await tasksCollection().doc(task.id).set({
        userId: task.userId,
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        priority: task.priority,
        category: task.category,
        tags: task.tags,
        isCompleted: task.isCompleted,
        completedAt: task.completedAt,
        createdAt: task.createdAt,
        updatedAt: new Date().toISOString(),
    });
};
