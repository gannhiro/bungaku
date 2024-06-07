import Color from 'color';

export function textColor(color: string) {
  return Color(color).isDark() ? '#fff' : '#000';
}
