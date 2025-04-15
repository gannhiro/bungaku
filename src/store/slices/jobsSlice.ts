import {
  get_manga_$_feed,
  mangadexAPI,
  res_at_home_$,
  res_get_cover_$,
  res_get_manga_$_feed,
} from '@api';
import notifee, {
  AndroidBadgeIconType,
  AndroidImportance,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  DownloadedChapterDetails,
  MangaDetails,
  UpdatedMangaNotifications,
} from '@types';
import {getDateMDEX} from '@utils';
import {ToastAndroid} from 'react-native';
import FS, {ReadDirItem} from 'react-native-fs';
import type {RootState} from '../store';
import {setError} from './errorSlice';
import {addRemToLibraryList} from './libraryListSlice';

const initialState: Record<string, JobStatus> = {};

type JobStatus = {
  status: 'pending' | 'succeeded' | 'failed';
  jobType: 'updateManga' | 'downloadChapter' | 'cacheChapter' | 'addOrRemoveFromLibrary';
  progress?: number;
  error?: string;
}

type DownloadChapterProps = {
  chapter: res_get_manga_$_feed['data'][0];
  mangaId: string;
  isDataSaver: boolean;
  isAnUpdate?: boolean;
};

type BulkDownloadChapters = {
  chapters: Array<res_get_manga_$_feed['data'][0]>;
  mangaId: string;
  isDataSaver: boolean;
  isAnUpdate?: boolean;
}

type CacheChapterProps = {
  chapter: res_get_manga_$_feed['data'][0];
  mangaId: string;
  isDataSaver: boolean;
  callback: (
    tempPages: {pagePromise?: Promise<FS.DownloadResult>; path: string}[],
    tempChapters: res_at_home_$,
  ) => void;
};

export const updateDownloadedMangaSettings = createAsyncThunk(
  'jobs/updateDownloadedMangaSettings',
  async (mangaDetails: MangaDetails, {fulfillWithValue, rejectWithValue}) => {
    try {
      await FS.writeFile(
        `${FS.DocumentDirectoryPath}/manga/${mangaDetails.manga.id}/manga-details.json`,
        JSON.stringify(mangaDetails),
      );

      ToastAndroid.show('Updated Settings', 500);
      return fulfillWithValue('success');
    } catch (error) {
      return rejectWithValue(error);
    } 
  },
);

export const updateManga = createAsyncThunk(
  'jobs/updateManga',
  async (
    mangaId: string,
    {rejectWithValue, fulfillWithValue, dispatch},
  ) => {
    const {
      manga,
      stayUpdated,
      stayUpdatedAfterDate,
      stayUpdatedLanguages,
      isDataSaver,
    }: MangaDetails = JSON.parse(
      await FS.readFile(
        `${FS.DocumentDirectoryPath}/manga/${mangaId}/manga-details.json`,
      ),
    );

    if (!stayUpdated) {
      return rejectWithValue(`${mangaId} should not stay updated.`);
    }

    const chapters: res_get_manga_$_feed['data'] = [];
    const limit = 500;
    let offset = 0;
    while (true) {
      const chapterData = await mangadexAPI<
        res_get_manga_$_feed,
        get_manga_$_feed
      >(
        'get',
        '/manga/$/feed',
        {
          limit: limit,
          offset: offset,
          order: {volume: 'asc', chapter: 'asc'},
          includes: ['scanlation_group', 'user'],
          createdAtSince: stayUpdatedAfterDate,
          translatedLanguage: stayUpdatedLanguages,
          includeEmptyPages: 0,
          includeFuturePublishAt: 0,
        },
        [mangaId],
      );

      if (chapterData.result === 'ok') {
        chapters.push(...chapterData.data);

        if (offset + limit < chapterData.total) {
          offset += limit;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    if (chapters.length === 0) {
      return rejectWithValue(`MANGA: ${mangaId} - FAILED`);
    }

    const allChapterIds: string[] = [];
    for (const lang of stayUpdatedLanguages) {
      const chaptersDirList = await FS.readDir(
        `${FS.DocumentDirectoryPath}/manga/${mangaId}/${lang}`,
      );

      allChapterIds.push(...chaptersDirList.map(dir => dir.name));
    }

    let chapterCount = 0;
    const MAX_CHAPTERS = 5;
    for (const chapter of chapters) {
      if (
        allChapterIds.includes(chapter.id) ||
        chapter.attributes.pages === 0 ||
        chapter.attributes.externalUrl
      ) {
        continue;
      }

      const promise = await dispatch(
        downloadChapter({chapter, mangaId, isDataSaver, isAnUpdate: true}),
      );

      if (promise.meta.requestStatus === 'fulfilled') {
        chapterCount++;
      }

      if (chapterCount === MAX_CHAPTERS) {
        break;
      }
    }

    if (!chapterCount) {
      return rejectWithValue(`MANGA: ${mangaId} - FAILED`);
    }

    const mangaListNotifId = await notifee.createChannel({
      id: `${mangaId}.updates-notif`,
      name: `${manga.attributes.title.en ?? 'no title'}`,
      vibration: false,
      importance: AndroidImportance.DEFAULT,
    });

    const previousChaptersTracker: UpdatedMangaNotifications[] = JSON.parse(
      (await AsyncStorage.getItem('library-updates')) ?? '[]',
    );
    const mangaIdExists = previousChaptersTracker.findIndex(
      val => val.mangaId === mangaId,
    );

    if (mangaIdExists === -1) {
      previousChaptersTracker.push({
        mangaId,
        newChapterCount: chapterCount,
        notificationId: mangaListNotifId,
      });
    } else {
      const oldCount = previousChaptersTracker[mangaIdExists].newChapterCount;
      previousChaptersTracker[mangaIdExists].newChapterCount =
        oldCount + chapterCount;
    }

    await AsyncStorage.setItem(
      'library-updates',
      JSON.stringify(previousChaptersTracker),
    );
    await notifee.displayNotification({
      id: mangaListNotifId,
      title: `${manga.attributes.title.en ?? 'No Title'} has been updated.`,
      body: `${chapterCount} Chapters has been downloaded!`,
      android: {
        channelId: mangaListNotifId,
        badgeIconType: AndroidBadgeIconType.SMALL,
      },
    });

    return fulfillWithValue(`MANGA: ${mangaId} - SUCCESS`);
  },
);

export const downloadChapter = createAsyncThunk(
  'jobs/downloadChapter',
  async (
    {chapter, mangaId, isAnUpdate = false}: DownloadChapterProps,
    {fulfillWithValue, rejectWithValue, signal},
  ) => {
    const chapterIsCached = await FS.exists(
      `${FS.CachesDirectoryPath}/${mangaId}/${chapter.id}`,
    );

    if (chapterIsCached) {
      await FS.moveFile(
        `${FS.CachesDirectoryPath}/${mangaId}/${chapter.id}`,
        `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.attributes.translatedLanguage}/${chapter.id}`,
      );
      return fulfillWithValue('success');
    }

    const chapterIsDownloaded = await FS.exists(
      `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.attributes.translatedLanguage}/${chapter.id}`,
    );

    if (chapterIsDownloaded && !isAnUpdate) {
      await FS.unlink(
        `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.attributes.translatedLanguage}/${chapter.id}`,
      );
      return rejectWithValue(`CHAPTER: ${chapter.id} - ALREADY EXISTS`);
    }

    if (chapterIsDownloaded && isAnUpdate) {
      return rejectWithValue(`CHAPTER: ${chapter.id} - ALREADY EXISTS`);
    }

    const langFolderExists = await FS.exists(
      `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.attributes.translatedLanguage}`,
    );

    if (!langFolderExists) {
      await FS.mkdir(
        `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.attributes.translatedLanguage}`,
      );
    }

    const chapterData = await mangadexAPI<res_at_home_$, {}>(
      'get',
      '/at-home/server/$',
      {},
      [chapter.id],
      undefined,
      signal,
    );

    if (chapterData?.result === 'ok') {
      const chapterDetails: DownloadedChapterDetails = {
        chapter,
        pageFileNames: chapterData.chapter.data,
        isDataSaver: false,
      };

      await FS.mkdir(
        `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.attributes.translatedLanguage}/${chapter.id}`,
      );

      await FS.writeFile(
        `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.attributes.translatedLanguage}/${chapter.id}/chapter.json`,
        JSON.stringify(chapterDetails),
      );

      const promises = chapterData.chapter.data.map(data => {
        const {promise} = FS.downloadFile({
          fromUrl: `${chapterData.baseUrl}/data/${chapterData.chapter.hash}/${data}`,
          toFile: `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.attributes.translatedLanguage}/${chapter.id}/${data}`,
        });
        return promise;
      });

      await Promise.allSettled(promises);
      return fulfillWithValue('success');
    }
  },
);

export const cacheChapter = createAsyncThunk(
  'jobs/cacheChapter',
  async (
    {chapter, mangaId, isDataSaver, callback}: CacheChapterProps,
    {fulfillWithValue, rejectWithValue, signal, dispatch},
  ) => {
    const cacheDirectory = `${FS.CachesDirectoryPath}/${mangaId}/${chapter.id}`;
    const data = await mangadexAPI<res_at_home_$, {}>(
      'get',
      '/at-home/server/$',
      {},
      [chapter.id],
    );

    if (data.result === 'ok') {
      await FS.mkdir(cacheDirectory);

      const downloadedChapters = isDataSaver
        ? data.chapter.dataSaver
        : data.chapter.data;

      const chapterDetails: DownloadedChapterDetails = {
        chapter: chapter,
        pageFileNames: downloadedChapters,
        isDataSaver,
      };

      await FS.writeFile(
        `${cacheDirectory}/chapter.json`,
        JSON.stringify(chapterDetails),
      );

      const pagePromises = downloadedChapters.map(pageId => {
        const pageUrl = `${data.baseUrl}/data-saver/${data.chapter.hash}/${pageId}`;
        const localPath = `${cacheDirectory}/${pageId}`;

        const pageDownloadPromise = FS.downloadFile({
          fromUrl: pageUrl,
          toFile: localPath,
        }).promise;

        return {
          pagePromise: pageDownloadPromise,
          path: `file://${localPath}`,
        };
      });

      callback(pagePromises, data);
      return fulfillWithValue('success');
    }

    if (data.result === 'aborted') {
      // TODO: handle error
    }

    if (data.result === 'internal-error') {
      // TODO: handle error
    }

    if (data.result === 'error') {
      dispatch(setError(data));
      console.error(`${data?.errors[0].status}: ${data?.errors[0].title}`);
      console.error(`${data?.errors[0].detail}`);
    }
  },
);

export const addOrRemoveFromLibrary = createAsyncThunk(
  'jobs/addRemToLibraryJob',
  async (
    {
      statistics,
      manga,
      stayUpdated,
      stayUpdatedAfterDate,
      stayUpdatedLanguages,
    }: MangaDetails,
    {dispatch},
  ) => {
    const mangaDirList: ReadDirItem[] = await FS.readDir(
      `${FS.DocumentDirectoryPath}/manga/`,
    );
    const mangaList = mangaDirList.map(dir => dir.name);
    try {
      const inLibraryIndex = mangaList.findIndex(id => id === manga.id);

      if (inLibraryIndex > -1) {
        mangaList.splice(inLibraryIndex, 1);
        await FS.unlink(`${FS.DocumentDirectoryPath}/manga/${manga.id}`);
        dispatch(addRemToLibraryList(manga.id));
        ToastAndroid.show('Removed from Library.', 1000);
        console.log('removed from library');
      } else {
        mangaList.push(manga.id);

        await FS.mkdir(`${FS.DocumentDirectoryPath}/manga/${manga.id}/`);

        for (const lang of manga.attributes.availableTranslatedLanguages) {
          await FS.mkdir(
            `${FS.DocumentDirectoryPath}/manga/${manga.id}/${lang}`,
          );
        }

        const coverItem = manga.relationships.find(
          rs => rs.type === 'cover_art',
        ) as res_get_cover_$['data'] | undefined;
        const coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverItem?.attributes.fileName}`;
        FS.downloadFile({
          fromUrl: coverUrl,
          toFile: `${FS.DocumentDirectoryPath}/manga/${manga.id}/cover.png`,
        });

        const toFile: MangaDetails = {
          manga,
          statistics,
          stayUpdated,
          stayUpdatedAfterDate,
          stayUpdatedLanguages,
          dateAdded: getDateMDEX(),
          isDataSaver: false,
        };
        await FS.writeFile(
          `${FS.DocumentDirectoryPath}/manga/${manga.id}/manga-details.json`,
          JSON.stringify(toFile),
        );

        ToastAndroid.show('Added to Library.', 1000);
        dispatch(addRemToLibraryList(manga.id));
        console.log(`${manga.id} - finished`);
      }
    } catch (e) {
      console.error(e);
      console.error(`error adding to library: ${manga.id}`);

      ToastAndroid.show('Adding to Library failed!', 1000);

      mangaList.splice(mangaList.indexOf(manga.id), 1);
      await FS.unlink(`${FS.DocumentDirectoryPath}/manga/${manga.id}`);
    } finally {
      console.log(`FINALIZED JOB: ${manga.id} - ${getDateMDEX()}`);
    }
  },
);

export const jobsSlice = createSlice({
  name: 'jobs',
  initialState: initialState,
  reducers: {
    updateJobProgress: (state, action: PayloadAction<{ jobId: string; progress: number }>) => {
      const { jobId, progress } = action.payload;
      const job = state[jobId];
      if (job && job.status === 'pending') { // Only update progress if pending
        job.progress = Math.max(0, Math.min(100, progress));
      }
    },
    clearJob: (state, action: PayloadAction<{ jobId: string }>) => {
      const { jobId } = action.payload;
      delete state[jobId];
    },
    clearFinishedJobs: (state) => {
      Object.keys(state).forEach(jobId => {
        if (state[jobId]?.status === 'succeeded' || state[jobId]?.status === 'failed') {
          delete state[jobId];
        }
      });
    }
  },
  extraReducers(builder) {
    builder
      .addCase(updateManga.pending, (state, action) => {
        const id = action.meta.arg
        console.log(`updateManga.pending: ${id}`);
        state[id] = { status: 'pending', jobType: 'updateManga', progress: 0 };
      })
      .addCase(updateManga.fulfilled, (state, action) => {
        const id = action.meta.arg
        console.log(`updateManga.fulfilled: ${id}`);
        state[id].status = 'succeeded';
        state[id].progress = 100;
      })
      .addCase(updateManga.rejected, (state, action) => {
        const id = action.meta.arg
        console.log(`updateManga.rejected: ${id}`);
        console.log(`reason: ${action.payload}`);
        state[id].status = 'failed';
        state[id].progress = undefined;
      })
      .addCase(downloadChapter.pending, (state, action) => {
        const id = action.meta.arg.chapter.id
        console.log(`downloadChapter.pending: ${id}`);
        state[id] = { status: 'pending', jobType: 'downloadChapter', progress: 0 };
      })
      .addCase(downloadChapter.fulfilled, (state, action) => {
        const id = action.meta.arg.chapter.id
        console.log(`downloadChapter.fulfilled: ${id}`);
        state[id].status = 'succeeded';
        state[id].progress = 100;
      })
      .addCase(downloadChapter.rejected, (state, action) => {
        const id = action.meta.arg.chapter.id
        console.log(`downloadChapter.rejected: ${id}`);
        console.log(`reason: ${action.payload}`);
        state[id].status = 'failed';
        state[id].progress = undefined;
      })
      .addCase(cacheChapter.pending, (state, action) => {
        const id = action.meta.arg.chapter.id
        console.log(`cacheChapter.pending: ${id}`);
        state[id] = { status: 'pending', jobType: 'cacheChapter', progress: 0 };
      })
      .addCase(cacheChapter.fulfilled, (state, action) => {
        const id = action.meta.arg.chapter.id
        console.log(`cacheChapter.fulfilled: ${id}`);
        state[id].status = 'succeeded';
        state[id].progress = 100;
      })
      .addCase(cacheChapter.rejected, (state, action) => {
        const id = action.meta.arg.chapter.id
        console.log(`cacheChapter.rejected: ${id}`);
        console.log(`reason: ${action.payload}`);
        state[id].status = 'failed';
        state[id].progress = undefined;
      })
      .addCase(addOrRemoveFromLibrary.pending, (state, action) => {
        const id = action.meta.arg.manga.id
        console.log(`addOrRemoveFromLibrary.pending: ${id}`);
        state[id] = { status: 'pending', jobType: 'addOrRemoveFromLibrary', progress: 0 };
      })
      .addCase(addOrRemoveFromLibrary.fulfilled, (state, action) => {
        const id = action.meta.arg.manga.id
        console.log(`addOrRemoveFromLibrary.fulfilled: ${id}`);
        state[id].status = 'succeeded';
        state[id].progress = 100;
      })
      .addCase(addOrRemoveFromLibrary.rejected, (state, action) => {
        const id = action.meta.arg.manga.id
        console.log(`addOrRemoveFromLibrary.rejected: ${id}`);
        console.log(`reason: ${action.payload}`);
        state[id].status = 'failed';
        state[id].progress = undefined;
      })
  },
});

export const {} = jobsSlice.actions;
export const jobs = (state: RootState) => state.jobs;
export default jobsSlice.reducer;
