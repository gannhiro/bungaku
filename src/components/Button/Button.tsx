import {ColorScheme, PRETENDARD_JP} from '@constants';
import {
  Dimensions,
  ImageStyle,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  TextStyle,
  Vibration,
  ViewStyle,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import Animated, {
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Progress from 'react-native-progress';
import {textColor, useAppCore} from '@utils';
import Color from 'color';

const {height} = Dimensions.get('screen');

type Props = {
  title: string;
  disabled?: boolean;
  loading?: boolean;
  fontSize?: number;
  labelColor?: string;
  btnColor?: string;
  imageReq?: number;
  shouldTintImage?: boolean;
  containerStyle?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
  labelStyle?: StyleProp<Animated.AnimateStyle<StyleProp<TextStyle>>>;
  imageStyle?: StyleProp<Animated.AnimateStyle<StyleProp<ImageStyle>>>;
  onButtonPress?: () => void;
};

export function Button({
  title,
  disabled = false,
  loading = false,
  containerStyle,
  labelStyle,
  labelColor,
  btnColor,
  onButtonPress,
  imageReq,
  imageStyle,
  shouldTintImage,
  fontSize,
}: Props) {
  const {colorScheme} = useAppCore();

  const styles = getStyles(colorScheme);

  const [progressBarWidth, setProgressBarWidth] = useState(0);

  const actualTextColor = labelColor ?? textColor(btnColor ?? colorScheme.colors.primary);

  const btnPressColor = btnColor
    ? Color(btnColor).darken(0.7).rgb().toString()
    : colorScheme.colors.secondary;

  const leftImageStyle = useAnimatedStyle(() => {
    return {
      tintColor: shouldTintImage ? actualTextColor : undefined,
    };
  });

  const buttonBg = useSharedValue(btnColor ?? colorScheme.colors.primary);
  const buttonStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: buttonBg.value,
      opacity: withTiming(disabled ? 0.5 : 1),
    };
  });

  const btnLabelColor = useSharedValue(actualTextColor);
  const buttonLabelStyle = useAnimatedStyle(() => {
    return {
      color: btnLabelColor.value,
      fontSize: fontSize ?? 12,
    };
  });

  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onStart(() => {
      buttonBg.value = withSequence(
        withTiming(btnPressColor, {
          duration: 100,
        }),
        withTiming(btnColor ?? colorScheme.colors.primary, {duration: 100}),
      );
      runOnJS(Vibration.vibrate)([0, 50], false);
    })
    .onEnd(() => {
      if (onButtonPress) {
        runOnJS(onButtonPress)();
      }
    });

  function onButtonLayout(e: LayoutChangeEvent) {
    setProgressBarWidth(e.nativeEvent.layout.width);
  }

  useEffect(() => {
    const newTextColor = labelColor ?? textColor(btnColor ?? colorScheme.colors.primary);
    buttonBg.value = btnColor ?? colorScheme.colors.primary;
    btnLabelColor.value = newTextColor;
  }, [colorScheme, btnColor, labelColor]);

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[styles.container, containerStyle, buttonStyle]}
        layout={LinearTransition}
        onLayout={onButtonLayout}>
        {imageReq && (
          <Animated.Image source={imageReq} style={[styles.image, leftImageStyle, imageStyle]} />
        )}
        <Animated.Text style={[styles.title, labelStyle, buttonLabelStyle]}>{title}</Animated.Text>
        {loading && (
          <Progress.Bar
            indeterminate
            color={colorScheme.colors.secondary}
            borderRadius={0}
            borderWidth={0}
            height={2}
            width={progressBarWidth}
            style={styles.progBar}
          />
        )}
      </Animated.View>
    </GestureDetector>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      overflow: 'hidden',
      flexDirection: 'row',
      borderRadius: 7,
      padding: height * 0.01,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      textAlign: 'center',
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 11,
    },
    progBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    image: {
      width: 15,
      height: 15,
      marginRight: 5,
    },
  });
}
