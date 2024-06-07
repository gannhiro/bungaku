import {StyleSheet} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {ColorScheme, systemOrangeLight} from '@constants';
import React, {useEffect} from 'react';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {RootState} from '@store';
import {textColor} from '@utils';

type Props = {
  showBadge: boolean;
  filterIconOnPress: () => void;
};

export function SearchFilterIcon({showBadge, filterIconOnPress}: Props) {
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  const pressedScale = useSharedValue(1);
  const pressedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: pressedScale.value}],
    };
  });
  const pressedTint = useSharedValue(textColor(colorScheme.colors.secondary));
  const filterIconStyle = useAnimatedStyle(() => {
    return {
      tintColor: pressedTint.value,
    };
  });

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => {
      pressedScale.value = withSequence(
        withTiming(1.2, {duration: 100}),
        withTiming(1),
      );
      pressedTint.value = withSequence(
        withTiming(colorScheme.colors.primary, {duration: 10}),
        withTiming(textColor(colorScheme.colors.primary)),
      );

      runOnJS(filterIconOnPress)();
    });

  const badgeOpacity = useSharedValue(1);
  const badgeOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(badgeOpacity.value, {
        easing: Easing.linear,
        duration: 200,
      }),
    };
  });

  useEffect(() => {
    if (showBadge) {
      badgeOpacity.value = 1;
    } else {
      badgeOpacity.value = 0;
    }
  }, [badgeOpacity, showBadge]);

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={pressedStyle}>
        <Animated.Image
          source={require('../../../assets/icons/filter-multiple.png')}
          style={[styles.filterIconCont, filterIconStyle]}
        />
        <Animated.View style={[styles.badgeOuter, badgeOpacityStyle]}>
          <Animated.View style={[styles.badgeInner]} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    filterIconCont: {
      width: 25,
      height: 25,
    },
    badgeOuter: {
      position: 'absolute',
      top: -3,
      left: 15,

      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',

      padding: 2,
      backgroundColor: colorScheme.colors.primary,
    },
    badgeInner: {
      width: 7,
      height: 7,
      borderRadius: 10,
      backgroundColor: systemOrangeLight,
    },
  });
}
