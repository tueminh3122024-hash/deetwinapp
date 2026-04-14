import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface Props {
  title: string;
  subTitle?: string;
  value: number;
  color: string;
  suffix?: string;
  size?: number;
}

export const MetricCircle: React.FC<Props> = ({ title, subTitle, value, color, suffix = '', size = 120 }) => {
  return (
    <View style={styles.outerContainer}>
        <View style={[
        styles.circle, 
        { 
            width: size, 
            height: size, 
            borderColor: color, 
            shadowColor: color,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
        }
        ]}>
        <View style={styles.valueRow}>
            <Text style={styles.value}>{value.toFixed(1)}</Text>
            {suffix ? <Text style={[styles.suffix, { color }]}>{suffix}</Text> : null}
        </View>
        </View>
        <Text style={[styles.title, { color }]}>{title}</Text>
        {subTitle ? <Text style={styles.subTitle}>{subTitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    margin: 10,
  },
  circle: {
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    borderStyle: 'solid',
    marginBottom: 10,
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
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subTitle: {
    color: THEME.colors.textDim,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  }
});


