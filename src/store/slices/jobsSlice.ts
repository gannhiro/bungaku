import {
  get_manga_$_feed,
  mangadexAPI,
  res_at_home_$,
  res_get_manga,
  res_get_manga_$_feed,
} from '@api';
import notifee, {AndroidBadgeIconType, AndroidImportance} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {DownloadedChapterDetails, UpdatedMangaNotifications} from '@types';
import {getDateTodayAtMidnight} from '@utils';
import {ToastAndroid} from 'react-native';
import FS from 'react-native-fs';
import type {RootState} from '../store';
import {setError} from './errorSlice';
import {AppAsyncThunkConfig} from '../types';

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
  chapter?: res_get_manga_$_feed['data'][0];
  manga?: res_get_manga['data'][0];
  progress?: number;
  error?: string;
};

type QueueDownloadChapter = {
  chapter: res_get_manga_$_feed['data'][0];
  manga: res_get_manga['data'][0];
  isDataSaver: boolean;
  isAnUpdate?: boolean;
  jobId: string;
};

type CacheChapterProps = {
  chapter: res_get_manga_$_feed['data'][0];
  manga: res_get_manga['data'][0];
  isDataSaver: boolean;
  callback: (
    tempPages: {pagePromise?: Promise<FS.DownloadResult>; path: string}[],
    tempChapters: res_at_home_$,
  ) => void;
};

// MARK: Thunks

export const updateManga = createAsyncThunk<string, string, AppAsyncThunkConfig>(
  'jobs/updateManga',
  async (mangaId, {rejectWithValue, fulfillWithValue, dispatch}) => {
    let mangaDetails: MangaDetails | null = JSON.parse(
      await FS.readFile(`${FS.DocumentDirectoryPath}/manga/${mangaId}/manga-details.json`),
    );

    if (!mangaDetails || !mangaDetails.stayUpdated) {
      return rejectWithValue({
        title: `${mangaId} details not found or should not stay updated.`,
        description: '',
      });
    }

    const {manga, stayUpdatedLanguages} = mangaDetails;
    const chapters: res_get_manga_$_feed['data'] = [];
    const limit = 500;
    let offset = 0;
    let totalChapters = 0;
    while (true) {
      const chapterData = await mangadexAPI<res_get_manga_$_feed, get_manga_$_feed>(
        'get',
        '/manga/$/feed',
        {
          limit: limit,
          offset: offset,
          order: {volume: 'asc', chapter: 'asc'},
          includes: ['scanlation_group', 'user'],
          updatedAtSince: getDateTodayAtMidnight(),
          translatedLanguage: stayUpdatedLanguages,
          includeEmptyPages: 0,
          includeFuturePublishAt: 0,
        },
        [mangaId],
      );

      if (chapterData.result === 'ok') {
        chapters.push(...chapterData.data);
        totalChapters = chapterData.total;
        if (offset + limit < totalChapters) {
          offset += limit;
        } else {
          break;
        }
      } else if (chapterData.result === 'error') {
        console.error(`API error fetching chapters for ${mangaId}:`, chapterData.errors);
        break;
      } else {
        console.warn(`Unexpected API result for ${mangaId}:`, chapterData.result);
        break;
      }
    }

    if (chapters.length === 0) {
      return rejectWithValue({
        title: `${mangaId} - No new chapters`,
        description: `${mangaId} - No new chapters found since at this time ${getDateTodayAtMidnight()}.`,
      });
    }

    let allChapterIds: string[] = [];
    for (const lang of stayUpdatedLanguages) {
      const langPath = `${FS.DocumentDirectoryPath}/manga/${mangaId}/${lang}`;

      if (await FS.exists(langPath)) {
        const chaptersDirList = await FS.readDir(langPath);
        allChapterIds.push(...chaptersDirList.map(dir => dir.name));
      }
    }

    let downloadableChapters = chapters.filter(
      chapter =>
        !(
          allChapterIds.includes(chapter.id) ||
          chapter.attributes.pages === 0 ||
          chapter.attributes.externalUrl
        ),
    );

    if (downloadableChapters.length === 0) {
      return rejectWithValue({
        title: `MANGA: ${mangaId} - All new chapters already downloaded or invalid`,
        description: '',
      });
    }

    downloadableChapters.forEach(chapter => {
      dispatch(
        queueDownloadChapter({
          chapter: chapter,
          isAnUpdate: true,
          isDataSaver: false,
          manga: manga,
        }),
      );
    });

    const channelId = await notifee.createChannel({
      id: `${mangaId}.updates-channel`,
      name: `${manga.attributes.title.en ?? mangaId}`,
      vibration: false,
      importance: AndroidImportance.DEFAULT,
    });

    const notificationId = await notifee.displayNotification({
      id: `${mangaId}.updates-notif`,
      title: `${manga.attributes.title.en ?? mangaId} has new chapters.`,
      body: `${downloadableChapters.length} new chapters found and queued for download.`,
      android: {
        channelId: channelId,
        badgeIconType: AndroidBadgeIconType.SMALL,
      },
    });

    const previousChaptersTracker: UpdatedMangaNotifications[] = JSON.parse(
      (await AsyncStorage.getItem('library-updates')) ?? '[]',
    );
    const mangaIdIndex = previousChaptersTracker.findIndex(val => val.mangaId === mangaId);

    if (mangaIdIndex === -1) {
      previousChaptersTracker.push({
        mangaId,
        newChapterCount: downloadableChapters.length,
        notificationId,
      });
    } else {
      const oldCount = previousChaptersTracker[mangaIdIndex].newChapterCount;
      previousChaptersTracker[mangaIdIndex].newChapterCount =
        oldCount + downloadableChapters.length;
    }

    await AsyncStorage.setItem('library-updates', JSON.stringify(previousChaptersTracker));

    return fulfillWithValue(
      `MANGA: ${mangaId} - ${downloadableChapters.length} chapters enqueued for update.`,
    );
  },
);

export const processDownloadQueue = createAsyncThunk<'success' | void, void, AppAsyncThunkConfig>(
  'jobs/processDownloadQueue',
  async (_, {getState, dispatch, fulfillWithValue, rejectWithValue}) => {
    const state = getState().jobs;
    const {activeDownloadsCount, downloadQueue} = state;

    if (activeDownloadsCount < MAX_CONCURRENT_DOWNLOADS && downloadQueue.length > 0) {
      const nextJob = downloadQueue[0];
      const {jobId, manga, chapter, isAnUpdate} = nextJob;

      const chapterDirectory = `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.attributes.translatedLanguage}/${chapter.id}`;
      const chapterIsDownloaded = await FS.exists(chapterDirectory);

      if (chapterIsDownloaded && isAnUpdate) {
        return fulfillWithValue('success');
      }

      if (chapterIsDownloaded && !isAnUpdate) {
        await FS.unlink(chapterDirectory);
        dispatch(clearJob({jobId}));
        return rejectWithValue({
          title: 'Chapter already downloaded',
          description: `${jobId}`,
        });
      }

      dispatch(downloadChapter(nextJob));
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
    {chapter, manga, isDataSaver, isAnUpdate = false, jobId},
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

    const chapterDirectory = `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.attributes.translatedLanguage}/${chapter.id}`;
    const cacheDirectory = `${FS.CachesDirectoryPath}/${manga.id}/${chapter.id}`;
    const chapterIsCached = await FS.exists(cacheDirectory);

    if (chapterIsCached) {
      await FS.moveFile(cacheDirectory, chapterDirectory);
      return fulfillWithValue({result: 'success', jobId});
    }

    const chapterIsDownloaded = await FS.exists(chapterDirectory);

    if (chapterIsDownloaded && isAnUpdate) {
      return fulfillWithValue({result: 'exists', jobId});
    }

    if (chapterIsDownloaded && !isAnUpdate) {
      await FS.unlink(chapterDirectory);
      return rejectWithValue({
        reason: 'Chapter already downloaded',
        jobId,
      });
    }

    const langFolderExists = await FS.exists(
      `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.attributes.translatedLanguage}`,
    );

    if (!langFolderExists) {
      await FS.mkdir(
        `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.attributes.translatedLanguage}`,
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

    const chapterDetails: DownloadedChapterDetails = {
      chapter,
      pageFileNames: pageList,
      isDataSaver: isDataSaver,
    };

    await FS.mkdir(chapterDirectory);

    await FS.writeFile(`${chapterDirectory}/chapter.json`, JSON.stringify(chapterDetails));

    let downloadedCount = 0;
    const totalPages = pageList.length;

    for (const page of pageList) {
      const {promise} = FS.downloadFile({
        fromUrl: `${chapterData.baseUrl}/${baseUrlSegment}/${chapterData.chapter.hash}/${page}`,
        toFile: `${chapterDirectory}/${page}`,
      });

      await promise;

      downloadedCount++;
      const currentProgress = downloadedCount / totalPages;
      dispatch(updateJobProgress({jobId, progress: currentProgress}));
    }

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
    // TODO
    const cacheDirectory = `${FS.CachesDirectoryPath}/${manga.id}/${chapter.id}`;
    const data = await mangadexAPI<res_at_home_$, {}>(
      'get',
      '/at-home/server/$',
      {},
      [chapter.id],
      undefined,
      signal,
    );

    if (data.result === 'ok') {
      await FS.mkdir(cacheDirectory);

      const downloadedChapters = isDataSaver ? data.chapter.dataSaver : data.chapter.data;
      const baseUrlSegment = isDataSaver ? 'data-saver' : 'data';

      const chapterDetails: DownloadedChapterDetails = {
        chapter: chapter,
        pageFileNames: downloadedChapters,
        isDataSaver,
      };

      await FS.writeFile(`${cacheDirectory}/chapter.json`, JSON.stringify(chapterDetails));

      const pagePromises: Promise<FS.DownloadResult>[] = downloadedChapters.map(pageId => {
        const pageUrl = `${data.baseUrl}/${baseUrlSegment}/${data.chapter.hash}/${pageId}`;
        const localPath = `${cacheDirectory}/${pageId}`;

        const {promise} = FS.downloadFile({
          fromUrl: pageUrl,
          toFile: localPath,
        });
        return promise;
      });

      const filePaths = downloadedChapters.map(pageId => `file://${cacheDirectory}/${pageId}`);

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
