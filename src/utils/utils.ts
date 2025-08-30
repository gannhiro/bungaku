import {Theme} from '@react-navigation/native';
import {ColorScheme} from '@constants';
import Color from 'color';

export function getTimestampHoursAgo(hoursAgo: number): string {
  const date = new Date();
  date.setUTCHours(date.getUTCHours() - hoursAgo);
  return date.toISOString().substring(0, 19);
}

// ^\d{4}-[0-1]\d-([0-2]\d|3[0-1])T([0-1]\d|2[0-3]):[0-5]\d:[0-5]\d$
// 2025-03-24T00:00:00

export function numberShorten(number: number) {
  if (number > 1000 && number < 10000) {
    return (number / 1000).toFixed(2) + 'K';
  }
  if (number > 10000 && number < 100000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  if (number > 100000) {
    return (number / 1000).toFixed(0) + 'K';
  }
  if (number > 1000000) {
    return (number / 1000000).toFixed(2) + 'M';
  }
  return number.toString();
}

export function textColor(color: string) {
  return Color(color).isDark() ? '#fff' : '#000';
}

export function themeConverter(colorScheme: ColorScheme): Theme {
  return {
    dark: colorScheme.type === 'dark',
    colors: {
      background: colorScheme.colors.main,
      primary: colorScheme.colors.primary,
      text: textColor(colorScheme.colors.main),
      notification: colorScheme.colors.primary,
      card: colorScheme.colors.secondary,
      border: colorScheme.colors.primary,
    },
  };
}
