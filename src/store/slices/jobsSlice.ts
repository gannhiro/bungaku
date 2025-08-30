import {get_manga_$_feed, mangadexAPI, res_at_home_$, res_get_manga_$_feed} from '@api';
import notifee, {AndroidBadgeIconType} from '@notifee/react-native';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {getTimestampHoursAgo} from '@utils';
import FS from 'react-native-fs';
import type {RootState} from '../store';
import {setError} from './errorSlice';
import {AppAsyncThunkConfig} from '../types';
import {Chapter, Manga, UserPreference} from '@db';
import {setOrUpdateMangaUpdate} from './libraryUpdates';
import {Language} from '@constants';

const MAX_CONCURRENT_DOWNLOADS = 1;
const initialState: {
  jobs: Record<string, JobStatus>;
  downloadQueue: QueueDownloadChapter[];
  activeDownloadsCount: number;
} = {
  jobs: {},
  downloadQueue: [],
  activeDownloadsCount: 0,
};

// MARK: Types

export type JobStatus = {
  status: 'pending' | 'succeeded' | 'failed' | 'queued';
  jobType: 'downloadChapter' | 'cacheChapter';
  chapter?: QueueDownloadChapter['chapter'];
  manga?: QueueDownloadChapter['manga'];
  progress?: number;
  error?: string;
};

type QueueDownloadChapter = {
  chapter: {
    id: string;
    title: string;
    translatedLanguage: Language;
    chapterNumber: number | null;
  };
  manga: {
    id: string;
    title: string;
  };
  isDataSaver: boolean;
  jobId: string;
};

type CacheChapterProps = {
  chapter: Chapter;
  manga: Manga;
  isDataSaver: boolean;
  callback: (
    tempPages: {pagePromise?: Promise<FS.DownloadResult>; path: string}[],
    tempChapters: res_at_home_$,
  ) => void;
};

// MARK: Thunks

export const checkForMangaUpdates = createAsyncThunk<string, string, AppAsyncThunkConfig>(
  'jobs/checkForMangaUpdates',
  async (mangaId, {getState, rejectWithValue, fulfillWithValue, dispatch}) => {
    const manga = await Manga.getMangaById(mangaId);
    if (!manga || !manga.stayUpdated) {
      return rejectWithValue({
        title: `Manga ${mangaId} not found or not marked for updates.`,
        description: '',
      });
    }

    const preferences = await UserPreference.getInstance();
    const language = preferences?.language ?? 'en';

    const apiChapters: res_get_manga_$_feed['data'] = [];
    const limit = 500;
    let offset = 0;
    while (true) {
      const chapterData = await mangadexAPI<res_get_manga_$_feed, get_manga_$_feed>(
        'get',
        '/manga/$/feed',
        {
          limit,
          offset,
          order: {volume: 'asc', chapter: 'asc'},
          updatedAtSince: getTimestampHoursAgo(48), // Safety buffer
          translatedLanguage: manga.stayUpdatedLanguages as string[],
          includeEmptyPages: 0,
          includeFuturePublishAt: 0,
        },
        [manga.id],
      );

      if (chapterData.result === 'ok') {
        apiChapters.push(...chapterData.data);
        if (offset + limit < chapterData.total) {
          offset += limit;
        } else {
          break;
        }
      } else {
        return rejectWithValue({
          title: 'API Error',
          description: `Failed to fetch chapters for ${manga.id}`,
        });
      }
    }

    if (apiChapters.length === 0) {
      return fulfillWithValue(`No recent API chapters found for ${manga.id}.`);
    }

    const existingChapterIds = (await Chapter.getChaptersForManga(manga.id)).map(c => c.chapterId);
    const newChapters = apiChapters.filter(
      apiChapter =>
        !existingChapterIds.includes(apiChapter.id) &&
        !apiChapter.attributes.externalUrl &&
        apiChapter.attributes.pages > 0,
    );

    if (newChapters.length === 0) {
      return fulfillWithValue(`No genuinely new chapters found for ${manga.id}.`);
    }

    await Chapter.upsertFromApiBulk(manga.id, newChapters);

    const title =
      manga.title?.[language] ??
      manga.altTitles?.find(altTitle => altTitle[language])?.[language] ??
      Object.values(manga?.title ?? {})[0] ??
      manga.title?.en ??
      manga.id;

    const notificationId = await notifee.displayNotification({
      id: `${manga.id}.updates-notif`,
      title: `${title} has new chapters.`,
      body: `${newChapters.length} new chapter(s) available.`,
      data: {
        mangaId: manga.id,
      },
      android: {
        channelId: 'library-updates',
        badgeIconType: AndroidBadgeIconType.SMALL,
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
      },
    });

    const currentUpdates = getState().libraryUpdates.updatedMangaList;
    const existingEntry = currentUpdates[manga.id];
    let finalChapterCount = newChapters.length;
    if (existingEntry) {
      finalChapterCount += existingEntry.newChapterCount;
    }

    dispatch(
      setOrUpdateMangaUpdate({
        mangaId: manga.id,
        updateInfo: {newChapterCount: finalChapterCount, notificationId},
      }),
    );

    return fulfillWithValue(
      `MANGA: ${manga.id} - Found and processed ${newChapters.length} new chapters.`,
    );
  },
);

export const processDownloadQueue = createAsyncThunk<'success' | void, void, AppAsyncThunkConfig>(
  'jobs/processDownloadQueue',
  async (_, {getState, dispatch}) => {
    const state = getState().jobs;
    const {activeDownloadsCount, downloadQueue} = state;

    if (activeDownloadsCount < MAX_CONCURRENT_DOWNLOADS && downloadQueue.length > 0) {
      const nextJob = downloadQueue[0];
      await dispatch(downloadChapter(nextJob));
    }
  },
);

export const downloadChapter = createAsyncThunk<
  {result: 'success' | 'failed' | 'aborted' | 'exists'; jobId: string},
  QueueDownloadChapter,
  {rejectValue: {reason: string; jobId: string}}
>(
  'jobs/downloadChapter',
  async (
    {chapter, manga, isDataSaver, jobId},
    {fulfillWithValue, rejectWithValue, signal, dispatch},
  ) => {
    dispatch(
      setJobStatus({
        jobId,
        status: {
          status: 'pending',
          jobType: 'downloadChapter',
          progress: 0,
          chapter,
          manga,
        },
      }),
    );

    const chapterDownloadDirectory = `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.translatedLanguage}/${chapter.id}`;
    const chapterCachedDirectory = `${FS.CachesDirectoryPath}/${manga.id}/${chapter.id}`;
    const chapterIsCached = await FS.exists(chapterCachedDirectory);

    if (chapterIsCached) {
      const dbChapter = await Chapter.getChapterById(chapter.id);

      if (!(await FS.exists(chapterDownloadDirectory))) {
        await FS.mkdir(chapterDownloadDirectory);
      }

      await FS.moveFile(chapterCachedDirectory, chapterDownloadDirectory);
      await dbChapter?.updateForDownload(isDataSaver, true);

      dispatch(clearJob({jobId}));

      return fulfillWithValue({result: 'success', jobId});
    }

    const chapterIsDownloaded = await FS.exists(chapterDownloadDirectory);

    if (chapterIsDownloaded) {
      const dbChapter = await Chapter.getChapterById(chapter.id);

      await FS.unlink(chapterDownloadDirectory);
      await dbChapter?.clearDownloadedData();

      dispatch(clearJob({jobId}));

      return fulfillWithValue({result: 'success', jobId});
    }

    const langFolderExists = await FS.exists(
      `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.translatedLanguage}`,
    );

    if (!langFolderExists) {
      await FS.mkdir(`${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.translatedLanguage}`);
    }

    const chapterData = await mangadexAPI<res_at_home_$, {}>(
      'get',
      '/at-home/server/$',
      {},
      [chapter.id],
      undefined,
      signal,
    );

    if (chapterData?.result === 'error') {
      dispatch(setError(chapterData));
      return rejectWithValue({
        reason: `API Error: ${chapterData.errors[0].title}`,
        jobId,
      });
    }

    if (signal?.aborted || chapterData?.result === 'aborted') {
      return fulfillWithValue({result: 'aborted', jobId});
    }

    if (chapterData?.result !== 'ok') {
      return rejectWithValue({
        reason: `API returned non-OK status: ${chapterData?.result}`,
        jobId,
      });
    }

    const pageList = isDataSaver ? chapterData.chapter.dataSaver : chapterData.chapter.data;
    const baseUrlSegment = isDataSaver ? 'data-saver' : 'data';

    await FS.mkdir(chapterDownloadDirectory);

    let downloadedCount = 0;
    const totalPages = pageList.length;

    for (const page of pageList) {
      const {promise} = FS.downloadFile({
        fromUrl: `${chapterData.baseUrl}/${baseUrlSegment}/${chapterData.chapter.hash}/${page}`,
        toFile: `${chapterDownloadDirectory}/${page}`,
      });

      await promise;

      downloadedCount++;
      const currentProgress = downloadedCount / totalPages;
      dispatch(updateJobProgress({jobId, progress: currentProgress}));
    }

    const dbChapter = await Chapter.getChapterById(chapter.id);
    await dbChapter?.updateForDownload(isDataSaver, true, pageList);

    return fulfillWithValue({result: 'success', jobId});
  },
);

export const cacheChapter = createAsyncThunk<
  {success: boolean; jobId: string},
  CacheChapterProps,
  {rejectValue: {reason: string; jobId: string}}
>(
  'jobs/cacheChapter',
  async (
    {chapter, manga, isDataSaver, callback}: CacheChapterProps,
    {fulfillWithValue, rejectWithValue, signal},
  ) => {
    const cachedChapterDirectory = `${FS.CachesDirectoryPath}/${manga.id}/${chapter.id}`;

    const data = await mangadexAPI<res_at_home_$, {}>(
      'get',
      '/at-home/server/$',
      {},
      [chapter.id],
      undefined,
      signal,
    );

    if (data.result === 'ok') {
      if (!(await FS.exists(cachedChapterDirectory))) await FS.mkdir(cachedChapterDirectory);

      const downloadedChapters = isDataSaver ? data.chapter.dataSaver : data.chapter.data;
      const baseUrlSegment = isDataSaver ? 'data-saver' : 'data';

      await chapter.updateForDownload(isDataSaver, false, downloadedChapters);

      const pagePromises: Promise<FS.DownloadResult>[] = downloadedChapters.map(pageId => {
        const pageUrl = `${data.baseUrl}/${baseUrlSegment}/${data.chapter.hash}/${pageId}`;
        const localPath = `${cachedChapterDirectory}/${pageId}`;
        const {promise} = FS.downloadFile({
          fromUrl: pageUrl,
          toFile: localPath,
        });

        return promise;
      });

      const filePaths = downloadedChapters.map(
        pageId => `file://${cachedChapterDirectory}/${pageId}`,
      );

      callback(
        pagePromises.map((promise, index) => ({
          path: filePaths[index],
          pagePromise: promise,
        })),
        data,
      );

      await Promise.allSettled(pagePromises);

      return fulfillWithValue({success: true, jobId: ''});
    }

    if (signal?.aborted || data.result === 'aborted') {
      return rejectWithValue({
        reason: 'Aborted',
        jobId: '', // TODO
      });
    }

    return rejectWithValue({
      reason: 'Aborted',
      jobId: '', // TODO
    });
  },
);

// MARK: Slice

export const jobsSlice = createSlice({
  name: 'jobs',
  initialState: initialState,
  reducers: {
    queueDownloadChapter: (state, action: PayloadAction<Omit<QueueDownloadChapter, 'jobId'>>) => {
      const potentialJobId = `${action.payload.manga.id}-${action.payload.chapter.id}`;
      const isInQueue = state.downloadQueue.some(
        item => item.chapter.id === action.payload.chapter.id,
      );

      const isAlreadyProcessing = Object.keys(state.jobs).some(existingJobId => {
        if (existingJobId.startsWith(potentialJobId)) {
          const job = state.jobs[existingJobId];
          return job && (job.status === 'pending' || job.status === 'queued');
        }
        return false;
      });

      if (!isInQueue && !isAlreadyProcessing) {
        const jobId = `${potentialJobId}`;
        const newQueueItem: QueueDownloadChapter = {
          ...action.payload,
          jobId,
        };

        state.downloadQueue.push(newQueueItem);

        state.jobs[jobId] = {
          manga: action.payload.manga,
          chapter: action.payload.chapter,
          status: 'queued',
          jobType: 'downloadChapter',
          progress: 0,
          error: 'Queued',
        };
        console.log(`Download Queued: ${jobId}`);
      } else {
        if (isInQueue) {
          console.log(`Download skipped: Chapter ${action.payload.chapter.id} already in queue.`);
        }
        if (isAlreadyProcessing) {
          console.log(`Download skipped: Chapter ${action.payload.chapter.id} already processing.`);
        }
      }
    },
    setJobStatus: (state, action: PayloadAction<{jobId: string; status: JobStatus}>) => {
      if (
        action.payload.status.jobType === 'downloadChapter' ||
        action.payload.status.jobType === 'cacheChapter'
      ) {
        state.jobs[action.payload.jobId] = action.payload.status;
      }
    },
    updateJobProgress: (state, action: PayloadAction<{jobId: string; progress: number}>) => {
      const {jobId, progress} = action.payload;
      const job = state.jobs[jobId];
      if (job && job.jobType === 'downloadChapter') {
        if (job.status === 'pending' || job.status === 'queued') {
          job.progress = progress;
          if (job.status === 'queued') job.status = 'pending';
          job.error = undefined;
        }
      }
    },
    clearJob: (state, action: PayloadAction<{jobId: string}>) => {
      const {jobId} = action.payload;
      state.downloadQueue = state.downloadQueue.filter(item => item.jobId !== jobId);
      delete state.jobs[jobId];
    },
    clearFinishedJobs: state => {
      Object.keys(state.jobs).forEach(jobId => {
        const job = state.jobs[jobId];
        if (job && (job.jobType === 'downloadChapter' || job.jobType === 'cacheChapter')) {
          if (job.status === 'succeeded') {
            delete state.jobs[jobId];
          }
        }
      });
    },
    cancelDownload: (state, action: PayloadAction<{jobId: string}>) => {
      const {jobId} = action.payload;
      const jobIndexInQueue = state.downloadQueue.findIndex(item => item.jobId === jobId);

      if (jobIndexInQueue > -1) {
        state.downloadQueue.splice(jobIndexInQueue, 1);
        if (state.jobs[jobId] && state.jobs[jobId].jobType === 'downloadChapter') {
          state.jobs[jobId].status = 'failed';
          state.jobs[jobId].error = 'Cancelled';
          state.jobs[jobId].progress = undefined;
        }
      } else {
        if (
          state.jobs[jobId] &&
          (state.jobs[jobId].jobType === 'downloadChapter' ||
            state.jobs[jobId].jobType === 'cacheChapter') &&
          state.jobs[jobId].status === 'pending'
        ) {
          state.jobs[jobId].status = 'failed';
          state.jobs[jobId].error = 'Cancelled';
          state.jobs[jobId].progress = undefined;
        }
      }
    },
  },

  // MARK: Extra Reducers

  extraReducers(builder) {
    builder
      .addCase(downloadChapter.pending, (state, action) => {
        const jobId = action.meta.arg.jobId;
        const jobInQueueIndex = state.downloadQueue.findIndex(item => item.jobId === jobId);

        if (jobInQueueIndex > -1) {
          state.activeDownloadsCount += 1;
          state.downloadQueue.splice(jobInQueueIndex, 1);
          console.log(`Download Starting: ${jobId}, Active: ${state.activeDownloadsCount}`);
        } else {
          state.activeDownloadsCount += 1;
          console.warn(
            `Download pending for job (${jobId}) not found in queue. Incrementing active count.`,
          );
        }
      })
      .addCase(downloadChapter.fulfilled, (state, action) => {
        const {jobId, result} = action.payload;
        state.activeDownloadsCount = Math.max(0, state.activeDownloadsCount - 1);
        if (state.jobs[jobId]) {
          state.jobs[jobId].status =
            result === 'success' || result === 'exists' ? 'succeeded' : 'failed';
          state.jobs[jobId].progress = 1;
          state.jobs[jobId].error =
            result === 'aborted'
              ? 'Aborted'
              : result === 'exists'
              ? 'Already downloaded'
              : undefined;
        }
        console.log(
          `Download Finished (Fulfilled): ${jobId}, Status: ${result}, Active: ${state.activeDownloadsCount}`,
        );
      })
      .addCase(downloadChapter.rejected, (state, action) => {
        const jobId = action.meta.arg.jobId;
        const reason = action.payload?.reason || action.error.message || 'Unknown rejection';
        state.activeDownloadsCount = Math.max(0, state.activeDownloadsCount - 1);
        if (state.jobs[jobId]) {
          state.jobs[jobId].status = 'failed';
          state.jobs[jobId].progress = undefined;
          state.jobs[jobId].error = reason;
        }
        console.log(
          `Download Finished (Rejected): ${jobId}, Reason: ${reason}, Active: ${state.activeDownloadsCount}`,
        );
      })
      .addCase(cacheChapter.pending, (state, action) => {
        // Job status handled by setJobStatus in thunk
      })
      .addCase(cacheChapter.fulfilled, (state, action) => {
        // Job status handled by setJobStatus in thunk
      })
      .addCase(cacheChapter.rejected, (state, action) => {
        // Job status handled by setJobStatus in thunk
      });
  },
});

export const {
  queueDownloadChapter,
  updateJobProgress,
  setJobStatus,
  clearJob,
  clearFinishedJobs,
  cancelDownload,
} = jobsSlice.actions;

export const selectJobsState = (state: RootState) => state.jobs;
export const selectJobsMap = (state: RootState) => state.jobs.jobs;
export default jobsSlice.reducer;
