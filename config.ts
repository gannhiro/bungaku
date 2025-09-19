import {Language, ColorSchemeName} from '@constants';
import {ReadingMode} from '@screens';

export type Config = {
  colorSchemeName: ColorSchemeName;
  language: Language;
  readingMode: ReadingMode;
  preferDataSaver: boolean;
  preferBGDownloadsDataSaver: boolean;
  allowPornography: boolean;
  maxConcurrentDownloads: number;
};

export const CONFIG: Config = {
  colorSchemeName: 'Dark',
  language: 'en',
  preferDataSaver: true,
  preferBGDownloadsDataSaver: false,
  allowPornography: false,
  readingMode: 'horizontal',
  maxConcurrentDownloads: 5,
};
