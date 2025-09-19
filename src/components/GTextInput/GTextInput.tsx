import {ColorScheme, PRETENDARD_JP} from '@constants';
import {textColor, useAppCore} from '@utils';
import React, {Dispatch, SetStateAction, useEffect, useRef, useState} from 'react';
import {Keyboard, KeyboardType, StyleSheet, TextInput, ViewStyle} from 'react-native';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';

type Props = {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  style?: ViewStyle;
  maxLength?: number;
  placeholder?: string;
  keyboardType?: KeyboardType;
  disabled?: boolean;
};

export function GTextInput({
  value,
  setValue,
  style,
  maxLength,
  placeholder = '',
  keyboardType = 'default',
  disabled = false,
}: Props) {
  const {colorScheme} = useAppCore();

  const styles = getStyles(colorScheme);

  const [focused, setFocused] = useState(false);

  const textInputRef = useRef<TextInput>(null);

  const textInputContainerAnim = useAnimatedStyle(() => {
    return {
      opacity: disabled ? 0.4 : 1,
      borderColor: focused
        ? withTiming(colorScheme.colors.primary)
        : withTiming(colorScheme.colors.secondary),
    };
  });

  function onFocusTextInput() {
    setFocused(true);
  }

  function onBlurTextInput() {
    setFocused(false);
  }

  function onChangeText(text: string) {
    setValue(text);
  }

  useEffect(() => {
    const keyboardSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setFocused(false);
      textInputRef.current?.blur();
    });

    return () => keyboardSubscription.remove();
  }, []);

  return (
    <Animated.View style={[styles.container, style, textInputContainerAnim]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.textInput}
        ref={textInputRef}
        placeholder={placeholder}
        placeholderTextColor={`${textColor(colorScheme.colors.main)}7`}
        onFocus={onFocusTextInput}
        onBlur={onBlurTextInput}
        keyboardType={keyboardType}
        editable={!disabled}
        maxLength={maxLength}
      />
    </Animated.View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      borderWidth: 2,
      borderColor: colorScheme.colors.secondary,
      borderRadius: 10,
    },
    textInput: {
      padding: 2,
      paddingHorizontal: 8,
      margin: 0,
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 14,
      color: textColor(colorScheme.colors.main),
    },
  });
}
