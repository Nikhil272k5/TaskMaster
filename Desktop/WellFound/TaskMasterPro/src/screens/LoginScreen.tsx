/**
 * LoginScreen — Animated auth form with validation
 * Features: email/password inputs, password visibility toggle,
 * error handling, animated transitions, persistent state
 */
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';
import { useAppDispatch, useAppSelector } from '../store';
import { login, clearError } from '../store/slices/authSlice';
import { getTheme, Spacing, FontSize, Radius } from '../theme/theme';
import { isValidEmail, isValidPassword } from '../utils/helpers';
import { APP, VALIDATION } from '../utils/constants';

interface LoginScreenProps {
    navigation: { navigate: (screen: string) => void };
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const dispatch = useAppDispatch();
    const themeMode = useAppSelector((state) => state.theme.mode);
    const { isLoading, error } = useAppSelector((state) => state.auth);
    const theme = getTheme(themeMode);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localErrors, setLocalErrors] = useState<{ email?: string; password?: string }>({});

    /** Validate form inputs */
    const validate = (): boolean => {
        const errors: { email?: string; password?: string } = {};
        if (!email.trim()) errors.email = 'Email is required';
        else if (!isValidEmail(email)) errors.email = 'Invalid email format';
        if (!password) errors.password = 'Password is required';
        else if (!isValidPassword(password))
            errors.password = `Minimum ${VALIDATION.MIN_PASSWORD_LENGTH} characters`;
        setLocalErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /** Handle login submission */
    const handleLogin = useCallback(() => {
        dispatch(clearError());
        if (!validate()) return;
        dispatch(login({ email: email.trim().toLowerCase(), password }));
    }, [dispatch, email, password]);

    return (
        <AnimatedBackground>
            <StatusBar
                barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Branding */}
                    <Animated.View entering={FadeIn.duration(600)} style={styles.brandSection}>
                        <Text style={styles.brandIcon}>✅</Text>
                        <Text style={[styles.brandTitle, { color: theme.colors.textPrimary }]}>
                            {APP.NAME}
                        </Text>
                        <Text style={[styles.brandTagline, { color: theme.colors.textMuted }]}>
                            {APP.TAGLINE}
                        </Text>
                    </Animated.View>

                    {/* Login Form */}
                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                        <GlassCard elevated>
                            <Text style={[styles.formTitle, { color: theme.colors.textPrimary }]}>
                                Welcome Back! 👋
                            </Text>
                            <Text style={[styles.formSub, { color: theme.colors.textMuted }]}>
                                Sign in to continue
                            </Text>

                            {/* Server error */}
                            {error && (
                                <View style={[styles.errorBanner, { backgroundColor: theme.colors.error + '15' }]}>
                                    <Text style={[styles.errorBannerText, { color: theme.colors.error }]}>
                                        {error}
                                    </Text>
                                </View>
                            )}

                            {/* Email */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>EMAIL</Text>
                                <View
                                    style={[
                                        styles.inputWrap,
                                        {
                                            backgroundColor: theme.colors.inputBackground,
                                            borderColor: localErrors.email
                                                ? theme.colors.error
                                                : theme.colors.inputBorder,
                                        },
                                    ]}
                                >
                                    <Text style={styles.inputIcon}>📧</Text>
                                    <TextInput
                                        style={[styles.input, { color: theme.colors.textPrimary }]}
                                        placeholder="example@email.com"
                                        placeholderTextColor={theme.colors.placeholder}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>
                                {localErrors.email && (
                                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                                        {localErrors.email}
                                    </Text>
                                )}
                            </View>

                            {/* Password */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>PASSWORD</Text>
                                <View
                                    style={[
                                        styles.inputWrap,
                                        {
                                            backgroundColor: theme.colors.inputBackground,
                                            borderColor: localErrors.password
                                                ? theme.colors.error
                                                : theme.colors.inputBorder,
                                        },
                                    ]}
                                >
                                    <Text style={styles.inputIcon}>🔒</Text>
                                    <TextInput
                                        style={[styles.input, { color: theme.colors.textPrimary }]}
                                        placeholder="Enter your password"
                                        placeholderTextColor={theme.colors.placeholder}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                                    </TouchableOpacity>
                                </View>
                                {localErrors.password && (
                                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                                        {localErrors.password}
                                    </Text>
                                )}
                            </View>

                            {/* Submit */}
                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: theme.colors.accent }]}
                                onPress={handleLogin}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitText}>Sign In</Text>
                                )}
                            </TouchableOpacity>

                            {/* Switch to Register */}
                            <View style={styles.switchRow}>
                                <Text style={[styles.switchText, { color: theme.colors.textMuted }]}>
                                    Don't have an account?{' '}
                                </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text style={[styles.switchLink, { color: theme.colors.accent }]}>
                                        Sign Up
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </GlassCard>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </AnimatedBackground>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xxxl,
    },
    brandSection: { alignItems: 'center', marginBottom: Spacing.xxl },
    brandIcon: { fontSize: 56, marginBottom: Spacing.sm },
    brandTitle: { fontSize: FontSize.hero, fontWeight: '800', letterSpacing: 1 },
    brandTagline: { fontSize: FontSize.md, marginTop: Spacing.xs },
    formTitle: { fontSize: FontSize.xxl, fontWeight: '700', marginBottom: Spacing.xs },
    formSub: { fontSize: FontSize.md, marginBottom: Spacing.xl },
    errorBanner: {
        padding: Spacing.md,
        borderRadius: Radius.md,
        marginBottom: Spacing.md,
    },
    errorBannerText: { fontSize: FontSize.sm, fontWeight: '600', textAlign: 'center' },
    inputGroup: { marginBottom: Spacing.lg },
    label: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        letterSpacing: 0.8,
        marginBottom: Spacing.sm,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Radius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
    },
    inputIcon: { fontSize: 18, marginRight: Spacing.sm },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: FontSize.md,
    },
    eyeIcon: { fontSize: 18, padding: Spacing.xs },
    errorText: { fontSize: FontSize.xs, marginTop: Spacing.xs, fontWeight: '500' },
    submitBtn: {
        paddingVertical: 16,
        borderRadius: Radius.md,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    submitText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '700', letterSpacing: 0.5 },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.xl,
    },
    switchText: { fontSize: FontSize.md },
    switchLink: { fontSize: FontSize.md, fontWeight: '700' },
});

export default LoginScreen;
