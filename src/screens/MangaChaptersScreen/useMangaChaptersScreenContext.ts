import {res_get_manga, res_get_statistics_manga, res_get_manga_$_feed} from '@api';
import {GenericDropdownValues} from '@components';
import {Language} from '@constants';
import {Chapter, Manga, MangaStatistic} from '@db';
import {Dispatch, SetStateAction, createContext, useContext} from 'react';

export interface iMangaChaptersScreenContext {
  manga?: Manga;
  statistics?: MangaStatistic | null;
  chapters: Chapter[];
  onAddToLibPress: () => Promise<void>;
  languages: Array<Language>;
  setLanguages: Dispatch<SetStateAction<Array<Language>>>;
  languageList: GenericDropdownValues;
  loading: boolean;
  loadingProgress: number;
  loadingText: string;
  setLoadingProgress: Dispatch<SetStateAction<number>>;
  setChapters: Dispatch<SetStateAction<Chapter[]>>;
  setLoadingText: Dispatch<SetStateAction<string>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setSelectMode: Dispatch<SetStateAction<boolean>>;
  selectMode: boolean;
  setSelectedChapters: Dispatch<SetStateAction<string[]>>;
  selectedChapters: string[];
  showDownloadedChapters: boolean;
  setShowDownloadedChapters: Dispatch<SetStateAction<boolean>>;
  order: 'asc' | 'desc';
  setOrder: Dispatch<SetStateAction<'asc' | 'desc'>>;
  orderItems: GenericDropdownValues;
}

export const MangaChaptersScreenContext = createContext<iMangaChaptersScreenContext | undefined>(
  undefined,
);

export function useMangaChaptersScreenContext(): iMangaChaptersScreenContext {
  const context = useContext(MangaChaptersScreenContext);

  if (!context) {
    throw new Error('undefined MCS Context');
  }

  return context;
}
