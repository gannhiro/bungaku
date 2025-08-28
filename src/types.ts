import {res_get_manga_$_feed} from '@api';

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
