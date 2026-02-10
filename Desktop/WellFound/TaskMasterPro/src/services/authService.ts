/**
 * Authentication Service
 * Handles all Firebase Auth operations
 */
import { firebaseAuth, db } from './firebase';
import { COLLECTIONS } from '../utils/constants';
import { UserProfile } from '../types';

/**
 * Register a new user with email, password, and display name
 * Also creates a user profile document in Firestore
 */
export const registerUser = async (
    email: string,
    password: string,
    displayName: string,
): Promise<UserProfile> => {
    const credential = await firebaseAuth().createUserWithEmailAndPassword(
        email,
        password,
    );

    /** Update the display name on the auth profile */
    await credential.user.updateProfile({ displayName });

    /** Create user document in Firestore for additional data */
    const userProfile: UserProfile = {
        uid: credential.user.uid,
        email: email.toLowerCase(),
        displayName,
        createdAt: new Date().toISOString(),
    };

    await db
        .collection(COLLECTIONS.USERS)
        .doc(credential.user.uid)
        .set(userProfile);

    return userProfile;
};

/**
 * Sign in an existing user with email and password
 */
export const loginUser = async (
    email: string,
    password: string,
): Promise<UserProfile> => {
    const credential = await firebaseAuth().signInWithEmailAndPassword(
        email,
        password,
    );

    return {
        uid: credential.user.uid,
        email: credential.user.email ?? email,
        displayName: credential.user.displayName ?? 'User',
        createdAt: credential.user.metadata.creationTime ?? new Date().toISOString(),
    };
};

/**
 * Sign out the current user
 */
export const logoutUser = async (): Promise<void> => {
    await firebaseAuth().signOut();
};

/**
 * Subscribe to auth state changes
 * Returns unsubscribe function
 */
export const onAuthStateChanged = (
    callback: (user: UserProfile | null) => void,
): (() => void) => {
    return firebaseAuth().onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
            callback({
                uid: firebaseUser.uid,
                email: firebaseUser.email ?? '',
                displayName: firebaseUser.displayName ?? 'User',
                createdAt:
                    firebaseUser.metadata.creationTime ?? new Date().toISOString(),
            });
        } else {
            callback(null);
        }
    });
};

/**
 * Get the currently signed-in user
 */
export const getCurrentUser = (): UserProfile | null => {
    const user = firebaseAuth().currentUser;
    if (!user) return null;

    return {
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? 'User',
        createdAt: user.metadata.creationTime ?? new Date().toISOString(),
    };
};
