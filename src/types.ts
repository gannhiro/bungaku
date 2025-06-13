import {res_get_manga, res_get_manga_$_feed, res_get_statistics_manga} from '@api';
import {Language} from './constants/languages';

export type MangaDetails = {
  dateAdded: string;
  isDataSaver: boolean;
  stayUpdated: boolean;
  stayUpdatedLanguages: Language[];
  manga: res_get_manga['data'][0];
  statistics: res_get_statistics_manga | undefined | null;
};

export type DownloadedChapterDetails = {
  chapter: res_get_manga_$_feed['data'][0];
  pageFileNames: string[];
  isDataSaver: boolean;
};

export type UpdatedMangaNotifications = {
  mangaId: string;
  newChapterCount: number;
  notificationId: string;
};
