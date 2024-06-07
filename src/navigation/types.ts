import {
  gen_error,
  res_get_group,
  res_get_manga,
  res_get_manga_$_feed,
  res_get_statistics_manga,
  res_get_user_$,
} from '@api';
import {ReadingMode} from '@screens';

export type RootStackParamsList = {
  SplashScreen: undefined;
  HomeScreen: undefined;
  TestScreen: undefined;
  LoginScreen: undefined;
  MangaChaptersScreen: {
    manga: res_get_manga['data'][0];
  };
  ReadChapterScreen: {
    mangaId: string;
    chapters: res_get_manga_$_feed['data'];
    initialChapterIndex: number;
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
};
