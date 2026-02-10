/**
 * FAB — Animated Floating Action Button
 * Scales on press, rotates icon, uses Reanimated spring physics
 */
import React from 'react';
import { StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { useAppSelector } from '../store';
import { getTheme, Shadows } from '../theme/theme';
import { ANIMATION } from '../utils/constants';

interface FABProps {
    onPress: () => void;
}

const FAB: React.FC<FABProps> = ({ onPress }) => {
    const themeMode = useAppSelector((state) => state.theme.mode);
    const theme = getTheme(themeMode);

    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);

    const handlePressIn = () => {
        scale.value = withSpring(0.85, { damping: ANIMATION.SPRING_DAMPING });
        rotation.value = withSpring(45, { damping: ANIMATION.SPRING_DAMPING });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: ANIMATION.SPRING_DAMPING });
        rotation.value = withSpring(0, { damping: ANIMATION.SPRING_DAMPING });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { rotate: `${rotation.value}deg` },
        ],
    }));

    return (
        <TouchableWithoutFeedback
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View
                style={[
                    styles.fab,
                    { backgroundColor: theme.colors.accent },
                    Shadows.glow(theme.colors.accent),
                    animatedStyle,
                ]}
            >
                <Animated.Text style={styles.icon}>+</Animated.Text>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    icon: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: '300',
        lineHeight: 34,
    },
});

export default FAB;
