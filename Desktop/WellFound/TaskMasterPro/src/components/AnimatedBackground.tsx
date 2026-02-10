/**
 * AnimatedBackground — Premium gradient with floating shapes
 * Uses LinearGradient for the gradient and Reanimated for animated floating shapes
 * Creates a living, breathing background without being distracting
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { useAppSelector } from '../store';

const { width, height } = Dimensions.get('window');

/** Floating shape configuration */
interface FloatingShape {
    size: number;
    x: number;
    y: number;
    color: string;
    duration: number;
}

const AnimatedBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const themeMode = useAppSelector((state) => state.theme.mode);
    const isDark = themeMode === 'dark';

    /** Animation progress values for floating shapes */
    const progress1 = useSharedValue(0);
    const progress2 = useSharedValue(0);
    const progress3 = useSharedValue(0);

    useEffect(() => {
        /** Slow, continuous floating animation — feels alive but subtle */
        progress1.value = withRepeat(
            withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true,
        );
        progress2.value = withRepeat(
            withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true,
        );
        progress3.value = withRepeat(
            withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true,
        );
    }, [progress1, progress2, progress3]);

    /** Shape 1: Large, top-right, slow float */
    const shape1Style = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(progress1.value, [0, 1], [0, 30]) },
            { translateX: interpolate(progress1.value, [0, 1], [0, -20]) },
            { scale: interpolate(progress1.value, [0, 0.5, 1], [1, 1.1, 1]) },
        ],
        opacity: interpolate(progress1.value, [0, 0.5, 1], [0.08, 0.12, 0.08]),
    }));

    /** Shape 2: Medium, center-left, medium float */
    const shape2Style = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(progress2.value, [0, 1], [0, -25]) },
            { translateX: interpolate(progress2.value, [0, 1], [0, 15]) },
        ],
        opacity: interpolate(progress2.value, [0, 0.5, 1], [0.06, 0.1, 0.06]),
    }));

    /** Shape 3: Small, bottom-right, faster float */
    const shape3Style = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(progress3.value, [0, 1], [0, 20]) },
            { translateX: interpolate(progress3.value, [0, 1], [0, -10]) },
            { rotate: `${interpolate(progress3.value, [0, 1], [0, 15])}deg` },
        ],
        opacity: interpolate(progress3.value, [0, 0.5, 1], [0.05, 0.08, 0.05]),
    }));

    const gradientColors = isDark
        ? ['#0F0C29', '#302B63', '#24243E']
        : ['#F0F2FF', '#E8EAFF', '#F5F3FF'];

    const shapeColor = isDark
        ? 'rgba(124, 131, 253, 0.15)'
        : 'rgba(92, 99, 224, 0.08)';

    return (
        <LinearGradient colors={gradientColors} style={styles.gradient}>
            {/* Floating shapes — subtle parallax motion */}
            <Animated.View
                style={[
                    styles.shape,
                    { width: 200, height: 200, top: 60, right: -40, backgroundColor: shapeColor },
                    shape1Style,
                ]}
            />
            <Animated.View
                style={[
                    styles.shape,
                    { width: 140, height: 140, top: height * 0.4, left: -30, backgroundColor: shapeColor },
                    shape2Style,
                ]}
            />
            <Animated.View
                style={[
                    styles.shape,
                    { width: 100, height: 100, bottom: 120, right: 20, backgroundColor: shapeColor, borderRadius: 24 },
                    shape3Style,
                ]}
            />
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    shape: {
        position: 'absolute',
        borderRadius: 999,
    },
});

export default AnimatedBackground;
