import {Appearance} from 'react-native';

export const mangaDexOrange = '#ff6d48';
export const neko = '#ff124a';
export const systemRedLight = 'rgb(255, 59, 48)';
export const systemOrangeLight = 'rgb(255, 149, 0)';
export const systemYellowLight = 'rgb(255, 204, 0)';
export const systemGreenLight = 'rgb(52, 199, 89)';
export const systemMintLight = 'rgb(0, 199, 190)';
export const systemTealLight = 'rgb(48, 176, 199)';
export const systemCyanLight = 'rgb(0, 173, 230)';
export const systemBlueLight = 'rgb(50, 122, 255)';
export const systemIndigoLight = 'rgb(88, 86, 214)';
export const systemPurpleLight = 'rgb(175, 82, 222)';
export const systemPinkLight = 'rgb(255, 45, 85)';
export const systemBrownLight = 'rgb(162, 132, 94)';

export const systemRedDark = 'rgb(255, 59, 48)';
export const systemOrangeDark = 'rgb(255, 159, 10)';
export const systemYellowDark = 'rgb(255, 214, 10)';
export const systemGreenDark = 'rgb(48, 209, 88)';
export const systemMintDark = 'rgb(99, 230, 226)';
export const systemTealDark = 'rgb(64, 200, 224)';
export const systemCyanDark = 'rgb(100, 210, 225)';
export const systemBlueDark = 'rgb(10, 132, 255)';
export const systemIndigoDark = 'rgb(94, 92, 230)';
export const systemPurpleDark = 'rgb(191, 90, 242)';
export const systemPinkDark = 'rgb(255, 55, 95)';
export const systemBrownDark = 'rgb(172, 142, 104)';

export const systemDarkGray1 = 'rgb(142, 142, 147)';
export const systemDarkGray2 = 'rgb(174, 174, 178)';
export const systemDarkGray3 = 'rgb(199, 199, 204)';
export const systemDarkGray4 = 'rgb(209, 209, 214)';
export const systemDarkGray5 = 'rgb(229, 229, 234)';
export const systemDarkGray6 = 'rgb(242, 242, 247)';

export const systemLightGray2 = 'rgb(99, 99, 102)';
export const systemLightGray1 = 'rgb(142, 142, 147)';
export const systemLightGray3 = 'rgb(72, 72, 74)';
export const systemLightGray4 = 'rgb(58, 58, 60)';
export const systemLightGray5 = 'rgb(44, 44, 46)';
export const systemLightGray6 = 'rgb(28, 28, 30)';

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

export const systemRed =
  Appearance.getColorScheme() === 'dark' ? systemRedDark : systemRedDark;
export const systemOrange =
  Appearance.getColorScheme() === 'dark' ? systemOrangeDark : systemOrangeLight;
export const systemYellow =
  Appearance.getColorScheme() === 'dark' ? systemYellowDark : systemYellowLight;
export const systemGreen =
  Appearance.getColorScheme() === 'dark' ? systemGreenDark : systemGreenLight;
export const systemMint =
  Appearance.getColorScheme() === 'dark' ? systemMintDark : systemMintLight;
export const systemTeal =
  Appearance.getColorScheme() === 'dark' ? systemTealDark : systemTealLight;
export const systemCyan =
  Appearance.getColorScheme() === 'dark' ? systemCyanDark : systemCyanLight;
export const systemBlue =
  Appearance.getColorScheme() === 'dark' ? systemBlueDark : systemBlueLight;
export const systemIndigo =
  Appearance.getColorScheme() === 'dark' ? systemIndigoDark : systemIndigoLight;
export const systemPurple =
  Appearance.getColorScheme() === 'dark' ? systemPurpleDark : systemPurpleLight;
export const systemPink =
  Appearance.getColorScheme() === 'dark' ? systemPinkDark : systemPinkLight;
export const systemBrown =
  Appearance.getColorScheme() === 'dark' ? systemBrownDark : systemBrownLight;

export const systemMain =
  Appearance.getColorScheme() === 'dark' ? black : white;
export const systemMainText =
  Appearance.getColorScheme() === 'dark' ? white : black;

export enum COLOR_SCHEMES {
  DARK = 'Dark',
  LIGHT = 'Light',
  JUNGLE = 'Jungle',
  JET = 'Jet',
}

export type ColorScheme = {
  name: COLOR_SCHEMES;
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

export const AVAILABLE_COLOR_SCHEMES: ColorScheme[] = [
  light,
  dark,
  jungle,
  jet,
];
