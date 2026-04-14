import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';
import { THEME } from '../constants/theme';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;
const CHART_HEIGHT = 150;

interface Props {
  data: number[];
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const LivePulseChart: React.FC<Props> = ({ data }) => {
  if (data.length < 2) return null;

  const max = Math.max(...data, 120);
  const min = Math.min(...data, 80);
  const range = max - min;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - ((val - min) / range) * CHART_HEIGHT;
    return `${x},${y}`;
  });

  const pathContent = `M ${points.join(' L ')}`;

  return (
    <View style={styles.container}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={THEME.colors.primary} stopOpacity="0.3" />
            <Stop offset="1" stopColor={THEME.colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        
        {/* Fill Area */}
        <Path
          d={`${pathContent} V ${CHART_HEIGHT} H 0 Z`}
          fill="url(#grad)"
        />
        
        {/* Line */}
        <Path
          d={pathContent}
          fill="none"
          stroke={THEME.colors.primary}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current Point Glow */}
        <Circle
          cx={(points[points.length - 1]).split(',')[0]}
          cy={(points[points.length - 1]).split(',')[1]}
          r="4"
          fill={THEME.colors.primary}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: CHART_HEIGHT,
    width: CHART_WIDTH,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center',
    overflow: 'visible',
  }
});
