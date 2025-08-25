import {ColorScheme, PRETENDARD_JP} from '@constants';
import {textColor, useAppCore} from '@utils';
import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, ViewStyle} from 'react-native';
import * as Progress from 'react-native-progress';

enum LABEL_DIRECTION {
  LEFT = 'left',
  RIGHT = 'right',
}

type Props = {
  icon: any;
  label?: string;
  labelDirecton?: `${LABEL_DIRECTION}`;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  onPressButton: () => void;
};

export function BigIconButton({
  icon = require('@assets/icons/close.png'),
  label,
  labelDirecton = LABEL_DIRECTION.LEFT,
  disabled = false,
  loading = false,
  style,
  onPressButton,
}: Props) {
  const {colorScheme} = useAppCore();

  const styles = getStyles(colorScheme);

  return (
    <TouchableOpacity
      style={[styles.iconPressable, style]}
      disabled={disabled}
      onPress={onPressButton}>
      {label && labelDirecton === LABEL_DIRECTION.LEFT && <Text style={styles.label}>{label}</Text>}
      {!loading ? (
        <Image source={icon} style={styles.icon} />
      ) : (
        <Progress.CircleSnail indeterminate size={30} color={colorScheme.colors.primary} />
      )}
      {label && labelDirecton === LABEL_DIRECTION.RIGHT && (
        <Text style={styles.label}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    iconPressable: {
      padding: 5,
      borderWidth: 2,
      borderColor: colorScheme.colors.primary,
      borderRadius: 8,
      marginRight: 10,

      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      height: 30,
      width: 30,
      tintColor: colorScheme.colors.primary,
    },
    label: {
      fontSize: 14,
      fontFamily: PRETENDARD_JP.BOLD,
      color: textColor(colorScheme.colors.main),
      marginLeft: 5,
    },
  });
}
