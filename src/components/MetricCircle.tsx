import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface Props {
  title: string;
  value: number;
  color: string;
  suffix?: string;
  size?: number;
}

export const MetricCircle: React.FC<Props> = ({ title, value, color, suffix = '', size = 120 }) => {
  return (
    <View style={[
      styles.container, 
      { 
        width: size, 
        height: size, 
        borderColor: color, 
        shadowColor: color,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      }
    ]}>
      <Text style={[styles.title, { color }]}>{title}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value.toFixed(1)}</Text>
        {suffix ? <Text style={[styles.suffix, { color }]}>{suffix}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    margin: 10,
    borderStyle: 'solid',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    color: THEME.colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -1,
  },
  suffix: {
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 2,
  },
  title: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  }
});
