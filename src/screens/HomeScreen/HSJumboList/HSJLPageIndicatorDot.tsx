import React, {StyleSheet} from 'react-native';
import {ColorScheme} from '@constants';
import {RootState, useAppSelector} from '@store';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  currentPage: number;
  index: number;
};

export function HSJLPageIndicatorDot({currentPage, index}: Props) {
  const {colorScheme} = useAppSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);
  const isActive = currentPage === index;

  const dotStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isActive ? 1 : 0.3, {duration: 200}),
      height: withSpring(isActive ? 12 : 6),
      width: withSpring(isActive ? 12 : 6),
    };
  });

  return <Animated.View key={index} style={[styles.dotIndicator, dotStyle]} />;
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    dotIndicator: {
      width: 6,
      height: 6,
      backgroundColor: colorScheme.colors.secondary,
      borderRadius: 10,
      opacity: 0.4,
    },
  });
}
