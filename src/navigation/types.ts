import {
  gen_error,
  res_get_group,
  res_get_manga,
  res_get_manga_$_feed,
  res_get_statistics_manga,
  res_get_user_$,
} from '@api';
import {Language} from '@constants';
import {ReadingMode} from '@screens';

export type RootStackParamsList = {
  KitchenSinkScreen: undefined;
  SplashScreen: undefined;
  HomeNavigator: undefined;
  TestScreen: undefined;
  LoginScreen: undefined;
  MangaChaptersScreen:
    | {
        manga: res_get_manga['data'][0];
        mangaId?: never;
      }
    | {
        manga?: never;
        mangaId: string;
      };
  ReadChapterScreen: {
    manga: res_get_manga['data'][0];
    chapters: res_get_manga_$_feed['data'];
    initialChapterIndex: number;
    originalLanguage: Language;
    scanlator?: res_get_group['data'][0];
    user?: res_get_user_$ | gen_error | undefined | null;
    oReadingMode?: ReadingMode;
  };
  CreditsScreen: undefined;
  ThemeModal: undefined;
  AddToLibraryModal: {
    manga: res_get_manga['data'][0];
    statistics?: res_get_statistics_manga;
  };
  LanguageModal: undefined;
};
