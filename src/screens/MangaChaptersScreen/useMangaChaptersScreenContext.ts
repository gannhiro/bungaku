import {
  res_get_manga,
  res_get_statistics_manga,
  res_get_manga_$_feed,
} from '@api';
import {GenericDropdownValues} from '@components';
import {Language} from '@constants';
import {Dispatch, SetStateAction, createContext, useContext} from 'react';

export interface iMangaChaptersScreenContext {
  manga: res_get_manga['data'][0];
  statistics: res_get_statistics_manga | null;
  chapters: res_get_manga_$_feed['data'];
  onAddToLibPress: () => Promise<void>;
  languages: Array<Language>;
  setLanguages: Dispatch<SetStateAction<Array<Language>>>;
  languageList: GenericDropdownValues;
  loading: boolean;
  loadingProgress: number;
  loadingText: string;
  setLoadingProgress: Dispatch<SetStateAction<number>>;
  setLoadingText: Dispatch<SetStateAction<string>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setSelectMode: Dispatch<SetStateAction<boolean>>;
  selectMode: boolean;
  setSelectedChapters: Dispatch<SetStateAction<string[]>>;
  selectedChapters: string[];
}

export const MangaChaptersScreenContext = createContext<
  iMangaChaptersScreenContext | undefined
>(undefined);

export function useMangaChaptersScreenContext(): iMangaChaptersScreenContext {
  const context = useContext(MangaChaptersScreenContext);

  if (!context) {
    throw new Error('undefined MCS Context');
  }

  return context;
}
