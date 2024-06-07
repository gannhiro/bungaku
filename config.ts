import {ColorScheme, Language, dark} from '@constants';
import {ReadingMode} from '@screens';

export type Config = {
  colorScheme: ColorScheme;
  language: Language;
  readingMode: ReadingMode;
  preferDataSaver: boolean;
  preferSystemColor: boolean;
  pornographyOK: boolean;
  SearchScreenConfig: {
    showSearchBar: boolean;
    showMangaList: boolean;
  };
};

export const CONFIG: Config = {
  colorScheme: dark,
  language: 'en',
  preferSystemColor: true,
  preferDataSaver: true,
  pornographyOK: false,
  readingMode: 'horizontal',
  SearchScreenConfig: {
    showSearchBar: true,
    showMangaList: true,
  },
};
