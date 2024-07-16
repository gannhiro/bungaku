import {Theme} from '@react-navigation/native';
import {ColorScheme} from '@constants';
import {textColor} from './textColor';

export function themeConverter(colorScheme: ColorScheme): Theme {
  return {
    dark: colorScheme.type === 'dark',
    colors: {
      background: colorScheme.colors.main,
      primary: colorScheme.colors.primary,
      text: textColor(colorScheme.colors.main),
      notification: colorScheme.colors.main,
      card: colorScheme.colors.secondary,
      border: colorScheme.colors.primary,
    },
  };
}
