/**
 * Firebase Configuration
 * Initializes Firebase App, Auth, and Firestore instances
 *
 * SETUP: Add google-services.json to android/app/
 * Enable Email/Password auth in Firebase Console
 * Create Firestore database in Firebase Console
 */
import firebase from '@react-native-firebase/app';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

/** Firebase Auth instance */
export const firebaseAuth = auth;

/** Firestore database instance */
export const db = firestore();

/** Auth types re-exported for convenience */
export type FirebaseUser = FirebaseAuthTypes.User;
export type FirebaseUserCredential = FirebaseAuthTypes.UserCredential;

export { firebase, auth, firestore };
