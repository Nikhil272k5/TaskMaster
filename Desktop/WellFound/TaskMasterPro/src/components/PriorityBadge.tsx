/**
 * PriorityBadge — Color-coded priority indicator
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Priority } from '../types';
import { PRIORITY_CONFIG } from '../utils/constants';
import { FontSize, Radius } from '../theme/theme';

interface PriorityBadgeProps {
    priority: Priority;
    compact?: boolean;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, compact = false }) => {
    const config = PRIORITY_CONFIG[priority];

    return (
        <View style={[styles.badge, { backgroundColor: config.bgColor }, compact && styles.compact]}>
            <Text style={styles.icon}>{config.icon}</Text>
            {!compact && (
                <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Radius.full,
        gap: 4,
    },
    compact: { paddingHorizontal: 6 },
    icon: { fontSize: 10 },
    label: { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
});

export default PriorityBadge;
