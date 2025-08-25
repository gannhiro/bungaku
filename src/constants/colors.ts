import {Appearance} from 'react-native';

export const mangaDexOrange = '#ff6d48';
export const neko = '#ff124a';
export const systemRedLight = 'rgba(255, 59, 48, 1)';
export const systemOrangeLight = 'rgba(255, 149, 0, 1)';
export const systemYellowLight = 'rgba(255, 204, 0, 1)';
export const systemGreenLight = 'rgba(52, 199, 89, 1)';
export const systemMintLight = 'rgba(0, 199, 190, 1)';
export const systemTealLight = 'rgba(48, 176, 199, 1)';
export const systemCyanLight = 'rgba(0, 173, 230, 1)';
export const systemBlueLight = 'rgba(50, 122, 255, 1)';
export const systemIndigoLight = 'rgba(88, 86, 214, 1)';
export const systemPurpleLight = 'rgba(175, 82, 222, 1)';
export const systemPinkLight = 'rgba(255, 45, 85, 1)';
export const systemBrownLight = 'rgba(162, 132, 94, 1)';

export const systemRedDark = 'rgba(255, 59, 48, 1)';
export const systemOrangeDark = 'rgba(255, 159, 10, 1)';
export const systemYellowDark = 'rgba(255, 214, 10, 1)';
export const systemGreenDark = 'rgba(48, 209, 88, 1)';
export const systemMintDark = 'rgba(99, 230, 226, 1)';
export const systemTealDark = 'rgba(64, 200, 224, 1)';
export const systemCyanDark = 'rgba(100, 210, 225, 1)';
export const systemBlueDark = 'rgba(10, 132, 255, 1)';
export const systemIndigoDark = 'rgba(94, 92, 230, 1)';
export const systemPurpleDark = 'rgba(191, 90, 242, 1)';
export const systemPinkDark = 'rgba(255, 55, 95, 1)';
export const systemBrownDark = 'rgba(172, 142, 104, 1)';

export const systemDarkGray1 = 'rgba(142, 142, 147, 1)';
export const systemDarkGray2 = 'rgba(174, 174, 178, 1)';
export const systemDarkGray3 = 'rgba(199, 199, 204, 1)';
export const systemDarkGray4 = 'rgba(209, 209, 214, 1)';
export const systemDarkGray5 = 'rgba(229, 229, 234, 1)';
export const systemDarkGray6 = 'rgba(242, 242, 247, 1)';

export const systemLightGray2 = 'rgba(99, 99, 102, 1)';
export const systemLightGray1 = 'rgba(142, 142, 147, 1)';
export const systemLightGray3 = 'rgba(72, 72, 74), 1';
export const systemLightGray4 = 'rgba(58, 58, 60, 1)';
export const systemLightGray5 = 'rgba(44, 44, 46, 1)';
export const systemLightGray6 = 'rgba(28, 28, 30, 1)';

export const white = '#fff';
export const black = '#000';

export const systemGray1 =
  Appearance.getColorScheme() === 'dark' ? systemDarkGray1 : systemLightGray1;
export const systemGray2 =
  Appearance.getColorScheme() === 'dark' ? systemDarkGray2 : systemLightGray2;
export const systemGray3 =
  Appearance.getColorScheme() === 'dark' ? systemDarkGray3 : systemLightGray3;
export const systemGray4 =
  Appearance.getColorScheme() === 'dark' ? systemDarkGray4 : systemLightGray4;
export const systemGray5 =
  Appearance.getColorScheme() === 'dark' ? systemDarkGray5 : systemLightGray5;
export const systemGray6 =
  Appearance.getColorScheme() === 'dark' ? systemDarkGray6 : systemLightGray6;

export const systemRed = Appearance.getColorScheme() === 'dark' ? systemRedDark : systemRedDark;
export const systemOrange =
  Appearance.getColorScheme() === 'dark' ? systemOrangeDark : systemOrangeLight;
export const systemYellow =
  Appearance.getColorScheme() === 'dark' ? systemYellowDark : systemYellowLight;
export const systemGreen =
  Appearance.getColorScheme() === 'dark' ? systemGreenDark : systemGreenLight;
export const systemMint = Appearance.getColorScheme() === 'dark' ? systemMintDark : systemMintLight;
export const systemTeal = Appearance.getColorScheme() === 'dark' ? systemTealDark : systemTealLight;
export const systemCyan = Appearance.getColorScheme() === 'dark' ? systemCyanDark : systemCyanLight;
export const systemBlue = Appearance.getColorScheme() === 'dark' ? systemBlueDark : systemBlueLight;
export const systemIndigo =
  Appearance.getColorScheme() === 'dark' ? systemIndigoDark : systemIndigoLight;
export const systemPurple =
  Appearance.getColorScheme() === 'dark' ? systemPurpleDark : systemPurpleLight;
export const systemPink = Appearance.getColorScheme() === 'dark' ? systemPinkDark : systemPinkLight;
export const systemBrown =
  Appearance.getColorScheme() === 'dark' ? systemBrownDark : systemBrownLight;

export const systemMain = Appearance.getColorScheme() === 'dark' ? black : white;
export const systemMainText = Appearance.getColorScheme() === 'dark' ? white : black;

export enum COLOR_SCHEMES {
  DARK = 'Dark',
  LIGHT = 'Light',
  JUNGLE = 'Jungle',
  JET = 'Jet',
}

export type ColorScheme = {
  name: `${COLOR_SCHEMES}`;
  type: 'dark' | 'light';
  colors: {
    main: string;
    primary: string;
    secondary: string;
  };
};

export const dark: ColorScheme = {
  name: COLOR_SCHEMES.DARK,
  type: 'dark',
  colors: {
    main: '#000000',
    primary: '#e6e6e9',
    secondary: '#9999a1',
  },
};

export const light: ColorScheme = {
  name: COLOR_SCHEMES.LIGHT,
  type: 'light',
  colors: {
    main: '#f8f9fa',
    primary: '#000',
    secondary: '#495057',
  },
};

export const jet: ColorScheme = {
  name: COLOR_SCHEMES.JET,
  type: 'dark',
  colors: {
    main: '#353535',
    primary: '#3c6e71',
    secondary: '#284b63',
  },
};

export const jungle: ColorScheme = {
  name: COLOR_SCHEMES.JUNGLE,
  type: 'dark',
  colors: {
    main: '#2F3E46',
    primary: '#52796F',
    secondary: '#354F52',
  },
};

export const AVAILABLE_COLOR_SCHEMES: ColorScheme[] = [light, dark, jungle, jet];
