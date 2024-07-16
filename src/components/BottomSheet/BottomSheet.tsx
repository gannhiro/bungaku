import {ColorScheme} from '@constants';
import {BlurView} from '@react-native-community/blur';
import {RootState} from '@store';
import React, {Dispatch, ReactNode, SetStateAction, useEffect} from 'react';
import {Dimensions, Keyboard, StyleSheet, View, ViewStyle} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  SlideInDown,
  SlideOutDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useSelector} from 'react-redux';

const {height: screenHeight, width} = Dimensions.get('screen');

type Props = {
  showBottomSheet: boolean;
  setShowBottomSheet: Dispatch<SetStateAction<boolean>>;
  height?: number;
  enableHandleGesture?: boolean;
  children?: ReactNode | ReactNode[];
  style?: ViewStyle;
  maxHeight?: number;
};

export function BottomSheet({
  showBottomSheet,
  setShowBottomSheet,
  height = screenHeight * 0.35,
  enableHandleGesture = true,
  children,
  style,
}: Props) {
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  const filteredChildren = Array.isArray(children)
    ? children.filter(child => child)
    : children;

  const containerHeight = useSharedValue(height);
  const containerAnimStyle = useAnimatedStyle(() => {
    return {
      height: containerHeight.value,
    };
  });

  if (containerHeight.value !== height && !showBottomSheet) {
    containerHeight.value = height;
  }

  const gesture = Gesture.Pan()
    .enabled(enableHandleGesture && !Keyboard.isVisible())
    .onChange(async event => {
      const val = screenHeight - event.absoluteY - 50;

      if (val / screenHeight > 0.85) {
        return;
      }

      if (val / screenHeight < 0.2) {
        runOnJS(setShowBottomSheet)(false);
      }

      containerHeight.value = withSpring(val);
    });

  useEffect(() => {
    const keyboardSubscription = Keyboard.addListener('keyboardDidShow', () => {
      containerHeight.value = withTiming(screenHeight * 0.45);
    });

    return () => keyboardSubscription.remove();
  }, [containerHeight]);

  if (!showBottomSheet) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.container, containerAnimStyle]}
      entering={SlideInDown.duration(250)}
      exiting={SlideOutDown}>
      <BlurView
        style={styles.containerBlur}
        blurType={colorScheme.type === 'light' ? 'light' : 'dark'}
        blurAmount={50}
      />
      <GestureDetector gesture={gesture}>
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
      </GestureDetector>
      <View style={style}>{filteredChildren}</View>
    </Animated.View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,

      height: screenHeight * 0.4,
      width: width,
      overflow: 'hidden',

      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      backgroundColor: `${colorScheme.colors.main}30`,

      zIndex: 1000,
    },
    containerBlur: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '100%',
    },
    handleContainer: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: colorScheme.colors.primary,
    },
    handle: {
      width: '35%',
      height: 4,
      borderRadius: 100,
      backgroundColor: colorScheme.colors.primary,

      alignSelf: 'center',
    },
  });
}
