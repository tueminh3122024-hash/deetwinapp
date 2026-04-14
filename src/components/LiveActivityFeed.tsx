import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { THEME } from '../constants/theme';
import Animated, { FadeInLeft } from 'react-native-reanimated';

interface Activity {
  id: string;
  time: string;
  message: string;
  type: 'sync' | 'alert' | 'info' | 'ai';
}

interface Props {
  activities: Activity[];
}

export const LiveActivityFeed: React.FC<Props> = ({ activities }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>LIVE ACTIVITY FEED</Text>
      <ScrollView 
        style={styles.feed} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activities.map((item, index) => (
          <Animated.View 
            entering={FadeInLeft.delay(index * 100)} 
            key={item.id} 
            style={styles.item}
          >
            <View style={[styles.dot, { backgroundColor: getIconColor(item.type) }]} />
            <View style={styles.textCol}>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

const getIconColor = (type: string) => {
  switch (type) {
    case 'sync': return THEME.colors.primary;
    case 'alert': return THEME.colors.alert;
    case 'ai': return THEME.colors.accent;
    default: return THEME.colors.textDim;
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    height: 300,
  },
  title: {
    color: THEME.colors.primary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 20,
  },
  feed: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 15,
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  textCol: {
    flex: 1,
  },
  message: {
    color: THEME.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  time: {
    color: THEME.colors.textDim,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  }
});
