import {Button, Dropdown, GenericDropdownValues} from '@components';
import {ColorScheme, ISO_LANGS, LABELS, Language, OTOMANOPEE, PRETENDARD_JP} from '@constants';
import {RootStackParamsList} from '@navigation';
import {BlurView} from '@react-native-community/blur';
import {StackScreenProps} from '@react-navigation/stack';
import {RootState, setInterfaceLanguageAsync, useAppDispatch, useAppSelector} from '@store';
import {textColor, useAppCore} from '@utils';
import React, {useEffect, useState} from 'react';
import {Dimensions, StyleSheet, Text} from 'react-native';
import Animated, {FadeIn, LinearTransition} from 'react-native-reanimated';

const {width, height} = Dimensions.get('screen');
type Props = StackScreenProps<RootStackParamsList, 'LanguageModal'>;

const languageItems: GenericDropdownValues = Object.keys(LABELS).map(label => {
  return {
    label: ISO_LANGS[label as keyof typeof ISO_LANGS].name,
    value: label,
  };
});

export function LanguageModal({navigation}: Props) {
  const {dispatch, colorScheme, preferences} = useAppCore();
  const {language} = preferences;
  const styles = getStyles(colorScheme);

  const [selectedLanguage, setSelectedLangugage] = useState<Language>(language);

  function onBackBtnPress() {
    navigation.pop();
  }

  useEffect(() => {
    dispatch(setInterfaceLanguageAsync(selectedLanguage));
  }, [dispatch, selectedLanguage]);

  return (
    <Animated.View style={[styles.container]} entering={FadeIn}>
      <BlurView style={styles.blur} blurType={colorScheme.type} blurRadius={3} />
      <Animated.View layout={LinearTransition} style={styles.innerCont}>
        <Text style={styles.label}>Interface Language</Text>
        <Dropdown
          items={languageItems}
          selection={selectedLanguage}
          setSelection={setSelectedLangugage}
        />
        <Button title="Back" onButtonPress={onBackBtnPress} containerStyle={styles.backBtn} />
      </Animated.View>
    </Animated.View>
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
      maxHeight: height * 0.9,
      backgroundColor: colorScheme.colors.main,
      borderRadius: 20,
      padding: 20,
      elevation: 5,
    },
    addToLibLabel: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.THIN,
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 15,
    },
    mangaTitleLabel: {
      color: textColor(colorScheme.colors.main),
      fontFamily: OTOMANOPEE,
      fontSize: 20,
      textAlign: 'center',
    },
    group: {
      justifyContent: 'center',
      marginTop: 10,
    },
    groupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    groupRowLabel: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 14,
    },
    groupSubLabel: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.LIGHT,
      fontSize: 9,
    },
    dateTextInputsRow: {
      flexDirection: 'row',
      marginTop: 5,
    },
    dateTextInputs: {
      flex: 1,
      backgroundColor: colorScheme.colors.primary,
      padding: 0,
      paddingHorizontal: 5,

      fontFamily: PRETENDARD_JP.REGULAR,
      color: textColor(colorScheme.colors.primary),
      borderRadius: 5,
      textAlign: 'center',

      borderWidth: 2,
    },
    dateTextInputsMid: {
      marginHorizontal: 5,
    },
    navButtonCancel: {
      flex: 1,
      marginRight: 10,
      marginTop: 20,
    },
    navButtonAdd: {
      flex: 1,
      marginTop: 20,
    },
  });
}
