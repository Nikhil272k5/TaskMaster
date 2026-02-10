/**
 * RegisterScreen — Animated registration with comprehensive validation
 */
import React, { useState, useCallback } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    ActivityIndicator, StatusBar, KeyboardAvoidingView,
    Platform, ScrollView,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';
import { useAppDispatch, useAppSelector } from '../store';
import { register, clearError } from '../store/slices/authSlice';
import { getTheme, Spacing, FontSize, Radius } from '../theme/theme';
import { isValidEmail, isValidPassword } from '../utils/helpers';
import { VALIDATION } from '../utils/constants';

interface RegisterScreenProps {
    navigation: { navigate: (screen: string) => void };
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
    const dispatch = useAppDispatch();
    const themeMode = useAppSelector((state) => state.theme.mode);
    const { isLoading, error } = useAppSelector((state) => state.auth);
    const theme = getTheme(themeMode);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        if (!name.trim()) errors.name = 'Name is required';
        if (!email.trim()) errors.email = 'Email is required';
        else if (!isValidEmail(email)) errors.email = 'Invalid email format';
        if (!password) errors.password = 'Password is required';
        else if (!isValidPassword(password))
            errors.password = `Minimum ${VALIDATION.MIN_PASSWORD_LENGTH} characters`;
        if (password !== confirmPassword) errors.confirm = 'Passwords do not match';
        setLocalErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRegister = useCallback(() => {
        dispatch(clearError());
        if (!validate()) return;
        dispatch(register({ name: name.trim(), email: email.trim().toLowerCase(), password }));
    }, [dispatch, name, email, password, confirmPassword]);

    const renderInput = (
        label: string, icon: string, value: string,
        onChange: (t: string) => void, errorKey: string,
        opts: { secure?: boolean; keyboard?: 'email-address' | 'default'; placeholder: string },
    ) => (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
            <View style={[styles.inputWrap, {
                backgroundColor: theme.colors.inputBackground,
                borderColor: localErrors[errorKey] ? theme.colors.error : theme.colors.inputBorder,
            }]}>
                <Text style={styles.inputIcon}>{icon}</Text>
                <TextInput
                    style={[styles.input, { color: theme.colors.textPrimary }]}
                    placeholder={opts.placeholder}
                    placeholderTextColor={theme.colors.placeholder}
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={opts.secure && !showPassword}
                    keyboardType={opts.keyboard ?? 'default'}
                    autoCapitalize={opts.keyboard === 'email-address' ? 'none' : 'words'}
                />
                {opts.secure && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                    </TouchableOpacity>
                )}
            </View>
            {localErrors[errorKey] && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>{localErrors[errorKey]}</Text>
            )}
        </View>
    );

    return (
        <AnimatedBackground>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeIn.duration(600)} style={styles.brandSection}>
                        <Text style={styles.brandIcon}>🚀</Text>
                        <Text style={[styles.brandTitle, { color: theme.colors.textPrimary }]}>Create Account</Text>
                        <Text style={[styles.brandTagline, { color: theme.colors.textMuted }]}>Join TaskMaster and boost your productivity</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                        <GlassCard elevated>
                            {error && (
                                <View style={[styles.errorBanner, { backgroundColor: theme.colors.error + '15' }]}>
                                    <Text style={[styles.errorBannerText, { color: theme.colors.error }]}>{error}</Text>
                                </View>
                            )}

                            {renderInput('FULL NAME', '👤', name, setName, 'name', { placeholder: 'John Doe' })}
                            {renderInput('EMAIL', '📧', email, setEmail, 'email', { placeholder: 'example@email.com', keyboard: 'email-address' })}
                            {renderInput('PASSWORD', '🔒', password, setPassword, 'password', { placeholder: 'Minimum 6 characters', secure: true })}
                            {renderInput('CONFIRM PASSWORD', '🔐', confirmPassword, setConfirmPassword, 'confirm', { placeholder: 'Re-enter password', secure: true })}

                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: theme.colors.success }]}
                                onPress={handleRegister}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Create Account</Text>}
                            </TouchableOpacity>

                            <View style={styles.switchRow}>
                                <Text style={[styles.switchText, { color: theme.colors.textMuted }]}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                    <Text style={[styles.switchLink, { color: theme.colors.accent }]}>Sign In</Text>
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
    scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xxxl },
    brandSection: { alignItems: 'center', marginBottom: Spacing.xxl },
    brandIcon: { fontSize: 56, marginBottom: Spacing.sm },
    brandTitle: { fontSize: FontSize.xxxl, fontWeight: '800' },
    brandTagline: { fontSize: FontSize.md, marginTop: Spacing.xs, textAlign: 'center' },
    errorBanner: { padding: Spacing.md, borderRadius: Radius.md, marginBottom: Spacing.md },
    errorBannerText: { fontSize: FontSize.sm, fontWeight: '600', textAlign: 'center' },
    inputGroup: { marginBottom: Spacing.md },
    label: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.8, marginBottom: Spacing.xs },
    inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.md },
    inputIcon: { fontSize: 18, marginRight: Spacing.sm },
    input: { flex: 1, paddingVertical: 14, fontSize: FontSize.md },
    eyeIcon: { fontSize: 18, padding: Spacing.xs },
    errorText: { fontSize: FontSize.xs, marginTop: Spacing.xs, fontWeight: '500' },
    submitBtn: { paddingVertical: 16, borderRadius: Radius.md, alignItems: 'center', marginTop: Spacing.md },
    submitText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '700', letterSpacing: 0.5 },
    switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
    switchText: { fontSize: FontSize.md },
    switchLink: { fontSize: FontSize.md, fontWeight: '700' },
});

export default RegisterScreen;
