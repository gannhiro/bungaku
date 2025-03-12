import {ColorScheme} from '@constants';
import {BlurView} from '@react-native-community/blur';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {RootState} from '@store';
import React, {
  Dispatch,
  Fragment,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import {
  BackHandler,
  Dimensions,
  Keyboard,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  ReduceMotion,
  SlideInDown,
  SlideOutDown,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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
  const navigation = useNavigation();
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  const filteredChildren = Array.isArray(children)
    ? children.filter(child => child)
    : children;

  const [keyboardVisible, setKeyboardVisible] = useState(false);

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
    .enabled(enableHandleGesture && !keyboardVisible)
    .onChange(async event => {
      const val = screenHeight - event.absoluteY - 50;

      if (val / screenHeight > 0.85) {
        return;
      }

      if (val / screenHeight < 0.2) {
        runOnJS(setShowBottomSheet)(false);
      }

      containerHeight.value = withSpring(val, {
        damping: 10,
        velocity: 100,
        reduceMotion: ReduceMotion.System,
      });
    });

  const bgTap = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => {
      setShowBottomSheet(false);
    });

  useEffect(() => {
    navigation.addListener('blur', () => {
      setShowBottomSheet(false);
    });
  }, [navigation, setShowBottomSheet]);

  useFocusEffect(() => {
    const backHandlerSub = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (showBottomSheet) {
          setShowBottomSheet(false);
        }
        return showBottomSheet;
      },
    );

    return () => backHandlerSub.remove();
  });

  useEffect(() => {
    const keyboardSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      runOnUI(() => {
        'worklet';
        const bottomSheetWillOverShoot =
          containerHeight.value + screenHeight * 0.5 >= screenHeight;

        if (bottomSheetWillOverShoot) {
          containerHeight.value = withSpring(screenHeight * 0.5, {
            damping: 10,
            velocity: 100,
            reduceMotion: ReduceMotion.System,
          });
        }
      })();
    });

    return () => keyboardSubscription.remove();
  }, [containerHeight, height]);

  useEffect(() => {
    const keyboardSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);

      runOnUI(() => {
        'worklet';

        containerHeight.value = containerHeight.value = withSpring(height, {
          damping: 10,
          velocity: 100,
          reduceMotion: ReduceMotion.System,
        });
      })();
    });

    return () => keyboardSubscription.remove();
  }, [containerHeight, height]);

  if (!showBottomSheet) {
    return null;
  }

  return (
    <Fragment>
      <GestureDetector gesture={bgTap}>
        <Animated.View
          style={styles.background}
          entering={FadeIn}
          exiting={FadeOut}
        />
      </GestureDetector>
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
    </Fragment>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    background: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#00000099',
    },
    container: {
      position: 'absolute',
      bottom: 0,

      height: screenHeight * 0.4,
      width: width,
      overflow: 'hidden',

      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,

      backgroundColor: colorScheme.colors.main,

      zIndex: 1000,
    },
    containerBlur: {
      position: 'absolute',
      height: '100%',
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
