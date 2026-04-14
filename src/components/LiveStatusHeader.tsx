import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  useAnimatedStyle,
  withSequence,
} from 'react-native-reanimated';
import { THEME } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const LiveStatusHeader = ({ onInfoPress }: { onInfoPress?: () => void }) => {
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => {
    return {
      opacity: pulse.value,
      transform: [{ scale: 1 + pulse.value * 0.5 }],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <Text style={styles.appName}>DEETWIN</Text>
        <Text style={styles.tagline}>ADAPTIVE HEALTH SYSTEM</Text>
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.statusBadge}>
            <Animated.View style={[styles.dot, dotStyle]} />
            <Text style={styles.statusText}>STREAMING LIVE 24/7</Text>
        </View>
        <TouchableOpacity style={styles.infoBtn} onPress={onInfoPress}>
            <Ionicons name="information-circle-outline" size={26} color={THEME.colors.textDim} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(4, 5, 12, 0.7)',
      }
    })
  },
  leftCol: {
    flexDirection: 'column',
  },
  appName: {
    color: THEME.colors.primary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tagline: {
    color: THEME.colors.textDim,
    fontSize: 10,
    fontWeight: '700',
    marginTop: -2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 45, 85, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 45, 85, 0.3)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.alert,
    marginRight: 8,
    shadowColor: THEME.colors.alert,
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  statusText: {
    color: THEME.colors.alert,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  infoBtn: {
    marginLeft: 15,
  }
});

