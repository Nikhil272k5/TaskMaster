/**
 * AppNavigator — Root navigation structure
 * Auth stack ↔ Main tabs with auth state listener
 * Animated screen transitions
 */
import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppSelector, useAppDispatch } from '../store';
import { setUser, sessionRestored } from '../store/slices/authSlice';
import { loadTheme } from '../store/slices/themeSlice';
import { onAuthStateChanged } from '../services/authService';
import { getTheme } from '../theme/theme';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from '../types';

/** Screens */
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TaskListScreen from '../screens/TaskListScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createStackNavigator<RootStackParamList>();

/** Auth navigator — Login/Register */
const AuthNavigator: React.FC = () => (
    <AuthStack.Navigator
        screenOptions={{
            headerShown: false,
            ...TransitionPresets.SlideFromRightIOS,
        }}
    >
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
);

/** Main tab navigator — TaskList, AddTask, Profile */
const MainNavigator: React.FC = () => {
    const themeMode = useAppSelector((state) => state.theme.mode);
    const theme = getTheme(themeMode);

    return (
        <MainTab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.tabBar,
                    borderTopColor: theme.colors.border,
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: theme.colors.accent,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            }}
        >
            <MainTab.Screen
                name="TaskList"
                component={TaskListScreen}
                options={{
                    tabBarLabel: 'Tasks',
                    tabBarIcon: ({ focused }) => (
                        <Text style={{ fontSize: 22 }}>{focused ? '📋' : '📄'}</Text>
                    ),
                }}
            />
            <MainTab.Screen
                name="AddTask"
                component={AddTaskScreen}
                options={{
                    tabBarLabel: 'Add',
                    tabBarIcon: ({ focused }) => (
                        <View style={[tabStyles.addBtn, { backgroundColor: theme.colors.accent }]}>
                            <Text style={tabStyles.addIcon}>+</Text>
                        </View>
                    ),
                }}
            />
            <MainTab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ focused }) => (
                        <Text style={{ fontSize: 22 }}>{focused ? '👤' : '👻'}</Text>
                    ),
                }}
            />
        </MainTab.Navigator>
    );
};

/** Root navigator — switches between Auth and Main based on auth state */
const AppNavigator: React.FC = () => {
    const dispatch = useAppDispatch();
    const themeMode = useAppSelector((state) => state.theme.mode);
    const { isAuthenticated, isRestoringSession } = useAppSelector((state) => state.auth);
    const theme = getTheme(themeMode);

    /** Listen for Firebase auth state changes */
    useEffect(() => {
        dispatch(loadTheme());
        const unsubscribe = onAuthStateChanged((user) => {
            dispatch(setUser(user));
        });
        return unsubscribe;
    }, [dispatch]);

    /** Splash screen while restoring session */
    if (isRestoringSession) {
        return (
            <View style={[styles.splash, { backgroundColor: theme.colors.background }]}>
                <Text style={styles.splashIcon}>✅</Text>
                <Text style={[styles.splashTitle, { color: theme.colors.textPrimary }]}>
                    TaskMaster Pro
                </Text>
                <ActivityIndicator
                    size="large"
                    color={theme.colors.accent}
                    style={styles.splashLoader}
                />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <RootStack.Navigator
                screenOptions={{
                    headerShown: false,
                    ...TransitionPresets.SlideFromRightIOS,
                }}
            >
                {isAuthenticated ? (
                    <>
                        <RootStack.Screen name="Main" component={MainNavigator} />
                        <RootStack.Screen name="TaskDetail" component={TaskDetailScreen} />
                        <RootStack.Screen name="EditTask" component={AddTaskScreen} />
                    </>
                ) : (
                    <RootStack.Screen name="Auth" component={AuthNavigator} />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
};

const tabStyles = StyleSheet.create({
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    addIcon: { color: '#fff', fontSize: 24, fontWeight: '300', lineHeight: 26 },
});

const styles = StyleSheet.create({
    splash: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    splashIcon: { fontSize: 64, marginBottom: 16 },
    splashTitle: { fontSize: 28, fontWeight: '800', letterSpacing: 1 },
    splashLoader: { marginTop: 24 },
});

export default AppNavigator;
