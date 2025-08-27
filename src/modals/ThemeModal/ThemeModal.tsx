import {Button, Dropdown, GenericDropdownValues} from '@components';
import {AVAILABLE_COLOR_SCHEMES, ColorSchemeName, ColorScheme, PRETENDARD_JP} from '@constants';
import {RootStackParamsList} from '@navigation';
import {BlurView} from '@react-native-community/blur';
import {StackScreenProps} from '@react-navigation/stack';
import {
  RootState,
  setColorSchemeAsync,
  setPreferSystemColorAsync,
  useAppDispatch,
  useAppSelector,
} from '@store';
import {textColor} from '@utils';
import React, {useEffect, useState} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import Animated, {LinearTransition} from 'react-native-reanimated';

const {width} = Dimensions.get('screen');

type Props = StackScreenProps<RootStackParamsList, 'ThemeModal'>;

export function ThemeModal({navigation}: Props) {
  const dispatch = useAppDispatch();
  const {colorScheme} = useAppSelector((state: RootState) => state.userPreferences);
  const styles = getStyles(AVAILABLE_COLOR_SCHEMES[colorScheme]);

  const [locColorScheme, setLocColorScheme] = useState<ColorSchemeName>(colorScheme);

  const choices: GenericDropdownValues = Object.keys(AVAILABLE_COLOR_SCHEMES).map(scheme => {
    return {
      label: scheme,
      value: scheme,
    };
  });

  function onBackBtnPress() {
    navigation.goBack();
  }

  useEffect(() => {
    dispatch(setColorSchemeAsync(locColorScheme));
  }, [dispatch, locColorScheme]);

  return (
    <View style={[styles.container]}>
      <BlurView style={styles.blur} blurType={AVAILABLE_COLOR_SCHEMES[colorScheme].type} />
      <Animated.View style={styles.innerCont} layout={LinearTransition}>
        <Text style={styles.label}>Theme</Text>
        <Dropdown
          items={choices}
          selection={locColorScheme}
          setSelection={setLocColorScheme}
          atLeastOne
        />
        <Button title="Back" onButtonPress={onBackBtnPress} containerStyle={styles.backBtn} />
      </Animated.View>
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    blur: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
    },
    label: {
      marginBottom: 5,
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
    },
    backBtn: {
      marginTop: 10,
    },
    innerCont: {
      width: width * 0.8,
      backgroundColor: colorScheme.colors.main,
      borderRadius: 20,
      padding: 20,
      elevation: 5,
    },
  });
}
