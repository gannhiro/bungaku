import {Language, ColorSchemeName} from '@constants';
import {ReadingMode} from '@screens';

export type Config = {
  colorScheme: ColorSchemeName;
  language: Language;
  readingMode: ReadingMode;
  preferDataSaver: boolean;
  preferBGDownloadsDataSaver: boolean;
  preferSystemColor: boolean;
  allowPornography: boolean;
};

export const CONFIG: Config = {
  colorScheme: 'Dark',
  language: 'en',
  preferSystemColor: false,
  preferDataSaver: true,
  preferBGDownloadsDataSaver: false,
  allowPornography: false,
  readingMode: 'horizontal',
};
