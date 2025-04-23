import {ColorScheme, Language, dark} from '@constants';
import {ReadingMode} from '@screens';

export type Config = {
  colorScheme: ColorScheme;
  language: Language;
  readingMode: ReadingMode;
  preferDataSaver: boolean;
  preferBGDownloadsDataSaver: boolean;
  preferSystemColor: boolean;
  allowPornography: boolean;
};

export const CONFIG: Config = {
  colorScheme: dark,
  language: 'en',
  preferSystemColor: true,
  preferDataSaver: true,
  preferBGDownloadsDataSaver: false,
  allowPornography: false,
  readingMode: 'horizontal',
};
