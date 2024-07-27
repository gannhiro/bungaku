import {Button, Dropdown, GenericDropdownValues} from '@components';
import {AVAILABLE_COLOR_SCHEMES, ColorScheme, PRETENDARD_JP} from '@constants';
import {RootStackParamsList} from '@navigation';
import {BlurView} from '@react-native-community/blur';
import {StackScreenProps} from '@react-navigation/stack';
import {RootState, setColorScheme, setPreferSystemColor} from '@store';
import {textColor} from '@utils';
import React, {useEffect, useState} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import Animated, {Layout} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';

const {width} = Dimensions.get('screen');

type Props = StackScreenProps<RootStackParamsList, 'ThemeModal'>;

export function ThemeModal({navigation}: Props) {
  const dispatch = useDispatch();
  const {colorScheme, preferSystemColor} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  const [locColorScheme, setLocColorScheme] = useState<ColorScheme['name']>(
    colorScheme.name,
  );

  const choices: GenericDropdownValues = AVAILABLE_COLOR_SCHEMES.map(scheme => {
    return {
      label: scheme.name,
      value: scheme.name,
    };
  });

  function onBackBtnPress() {
    navigation.goBack();
  }

  useEffect(() => {
    const locScheme = AVAILABLE_COLOR_SCHEMES.find(scheme => {
      return scheme.name === locColorScheme;
    });

    if (preferSystemColor) {
      dispatch(setPreferSystemColor(false));
      return;
    }

    if (locScheme) {
      dispatch(setColorScheme(locScheme));
    }
  }, [dispatch, locColorScheme, preferSystemColor]);

  return (
    <View style={[styles.container]}>
      <BlurView style={styles.blur} blurType={colorScheme.type} />
      <Animated.View style={styles.innerCont} layout={Layout}>
        <Text style={styles.label}>Theme</Text>
        <Dropdown
          items={choices}
          selection={locColorScheme}
          setSelection={setLocColorScheme}
        />
        <Button
          title="Back"
          onButtonPress={onBackBtnPress}
          containerStyle={styles.backBtn}
        />
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
