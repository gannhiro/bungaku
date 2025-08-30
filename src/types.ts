import {Chapter} from '@db';

export type DownloadedChapterDetails = {
  chapter: Chapter;
  pageFileNames: string[];
  isDataSaver: boolean;
};

export type UpdatedMangaNotifications = {
  [key: string]: {
    newChapterCount: number;
    notificationId: string;
  };
};
