import {gen_error, res_get_group, res_get_manga_$_feed, res_get_user_$} from '@api';
import {Language} from '@constants';
import {Chapter, Manga, MangaStatistic} from '@db';
import {ReadingMode} from '@screens';

export type RootStackParamsList = {
  KitchenSinkScreen: undefined;
  SplashScreen: undefined;
  HomeNavigator: undefined;
  TestScreen: undefined;
  LoginScreen: undefined;
  MangaChaptersScreen: {
    mangaId: string;
  };
  ReadChapterScreen: {
    manga: Manga;
    chapters: Chapter[];
    initialChapterIndex: number;
    originalLanguage: Language;
    scanlator?: res_get_group['data'][0];
    user?: res_get_user_$ | gen_error | undefined | null;
    oReadingMode?: ReadingMode;
  };
  CreditsScreen: undefined;
  ThemeModal: undefined;
  AddToLibraryModal: {
    manga: Manga;
    statistics?: MangaStatistic;
  };
  LanguageModal: undefined;
};
