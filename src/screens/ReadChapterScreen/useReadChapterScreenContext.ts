import {res_get_group_$, res_get_manga_$_feed, res_get_user_$} from '@api';
import {GenericDropdownValues} from '@components';
import {Dispatch, SetStateAction, createContext, useContext} from 'react';
import {ReadingMode} from './ReadChapterScreen';
import {RootStackParamsList} from '@navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import {Chapter} from '@db';

export interface iReadChapterScreenContext {
  navigation: StackNavigationProp<RootStackParamsList, 'ReadChapterScreen', undefined>;
  chapters: Chapter[];
  currentChapter: number;
  setCurrentChapter: Dispatch<SetStateAction<number>>;
  scanlator?: res_get_group_$['data'];
  user?: res_get_user_$['data'];
  readingModes: GenericDropdownValues;
  locReadingMode: ReadingMode;
  setLocReadingMode: Dispatch<SetStateAction<ReadingMode>>;
  setShowBottomOverlay: Dispatch<SetStateAction<boolean>>;
  isDataSaver: boolean;
  onDataSaverSwitchChange: (value: boolean) => void;
}

export const ReadChapterScreenContext = createContext<iReadChapterScreenContext | undefined>(
  undefined,
);

export function useReadChapterScreenContext(): iReadChapterScreenContext {
  const context = useContext(ReadChapterScreenContext);

  if (!context) {
    throw new Error('undefined RCS Context');
  }

  return context;
}
