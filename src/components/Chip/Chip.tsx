import {ColorScheme, PRETENDARD_JP} from '@constants';
import {RootState} from '@store';
import {textColor} from '@utils';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';

type Props = {
  label: string;
};

export function Chip({label}: Props) {
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      padding: 5,
      borderRadius: 3,
      backgroundColor: colorScheme.colors.secondary,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
      marginRight: 3,
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: 10,
      marginRight: 3,
      backgroundColor: textColor(colorScheme.colors.secondary),
    },
    label: {
      fontSize: 8,
      fontFamily: PRETENDARD_JP.MEDIUM,
      color: textColor(colorScheme.colors.secondary),
    },
  });
}
