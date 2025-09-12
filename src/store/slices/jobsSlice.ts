import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';
import {AppAsyncThunkConfig} from '../types';
import {Chapter, Job, Manga, database} from '@db';
import {Language} from '@constants';
import * as FS from 'react-native-fs';
import {Model, Q} from '@nozbe/watermelondb';
import {mangadexAPI, res_at_home_$} from '@api';

// MARK: TYPES
export type JobPayload = {
  jobId: string;
  progress: number;
  isDataSaver: boolean;
  status: 'active' | 'succeeded' | 'failed' | 'queued';
  chapter: {
    id: string;
    totalPages: number;
    translatedLanguage: Language;
    chapterNumber: string | null;
    title: string | null;
  };
  manga: {
    id: string;
    title: string;
  };
  createdAt: number;
  error?: string;
};

export type QueueDownloadChapterPayload = {
  manga: Manga;
  chapter: Chapter;
};

export type CacheChapterProps = {
  chapter: Chapter;
  mangaId: string;
  isDataSaver: boolean;
};

type CacheChapterResult = {
  pageDownloads: {path: string; pagePromise?: Promise<FS.DownloadResult>}[];
  chapterData: res_at_home_$;
};

type JobsState = {
  jobs: Record<string, JobPayload>;
};

const initialState: JobsState = {
  jobs: {},
};

const MAX_CONCURRENT_DOWNLOADS = 2;
let activeDownloads = 0;

// MARK: THUNKS
const processJobsQueue = createAsyncThunk<void, void, AppAsyncThunkConfig>(
  'jobs/processQueue',
  async (_, {getState, dispatch}) => {
    const state = getState();
    const jobs = state.jobs.jobs;
    const queuedJobs = Object.values(jobs)
      .filter(job => job.status === 'queued')
      .sort((a, b) => a.createdAt - b.createdAt);

    while (activeDownloads < MAX_CONCURRENT_DOWNLOADS && queuedJobs.length > 0) {
      const nextJob = queuedJobs.shift();
      if (nextJob) {
        dispatch(downloadChapterJob(nextJob));
      }
    }
  },
);

const downloadChapterJob = createAsyncThunk<void, JobPayload, AppAsyncThunkConfig>(
  'jobs/downloadChapter',
  async (jobPayload, {dispatch}) => {
    const {jobId, chapter, manga, isDataSaver} = jobPayload;
    const jobDb = await Job.getJobById(jobId);

    if (!jobDb) {
      console.error(`Job not found in DB for download: ${jobId}`);
      return;
    }

    activeDownloads++;
    await jobDb.updateState({status: 'active', progress: 0});
    dispatch(updateJob({jobId, updates: {status: 'active', progress: 0}}));

    try {
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
        await jobDb.updateState({status: 'succeeded', progress: jobPayload.chapter.totalPages});
        dispatch(
          updateJob({
            jobId,
            updates: {status: 'succeeded', progress: jobPayload.chapter.totalPages},
          }),
        );
        return;
      }

      const chapterData = await mangadexAPI<res_at_home_$, {}>('get', '/at-home/server/$', {}, [
        chapter.id,
      ]);
      if (chapterData?.result !== 'ok') {
        const errorMsg =
          chapterData?.result === 'error' ? chapterData.errors[0].title : 'API request failed';
        await jobDb.updateState({status: 'failed', error: errorMsg});
        dispatch(updateJob({jobId, updates: {status: 'failed', error: errorMsg}}));
        return;
      }

      if (!(await FS.exists(chapterDownloadDirectory))) {
        await FS.mkdir(chapterDownloadDirectory);
      }

      let downloadedCount = jobDb.progress;
      const pageList = isDataSaver ? chapterData.chapter.dataSaver : chapterData.chapter.data;
      const pagesToDownload = pageList.slice(downloadedCount);
      const baseUrlSegment = isDataSaver ? 'data-saver' : 'data';

      for (const page of pagesToDownload) {
        const urlToDownload = `${chapterData.baseUrl}/${baseUrlSegment}/${chapterData.chapter.hash}/${page}`;
        const {promise} = FS.downloadFile({
          fromUrl: urlToDownload,
          toFile: `${chapterDownloadDirectory}/${page}`,
        });

        await promise;
        downloadedCount++;
        await jobDb.updateState({progress: downloadedCount});
        dispatch(updateJob({jobId, updates: {progress: downloadedCount}}));
      }

      const dbChapter = await Chapter.getChapterById(chapter.id);
      await dbChapter?.updateForDownload(isDataSaver, true, pageList);
      await jobDb.updateState({status: 'succeeded', progress: downloadedCount});
      dispatch(updateJob({jobId, updates: {status: 'succeeded', progress: downloadedCount}}));
    } catch (error: any) {
      const errorMessage = error.message || 'An unknown error occurred';
      await jobDb.updateState({status: 'failed', error: errorMessage});
      dispatch(updateJob({jobId, updates: {status: 'failed', error: errorMessage}}));
    } finally {
      activeDownloads--;
      dispatch(processJobsQueue());
    }
  },
);

export const initializeJobs = createAsyncThunk<void, void, AppAsyncThunkConfig>(
  'jobs/initialize',
  async (_, {dispatch}) => {
    console.log('Initializing Jobs...');
    const jobCollection = database.get<Job>(Job.table);
    const stuckJobs = await jobCollection.query(Q.where('status', 'active')).fetch();

    if (stuckJobs.length > 0) {
      console.log(`Found ${stuckJobs.length} stuck jobs. Re-queueing...`);
      const updates = stuckJobs.map(job =>
        job.prepareUpdate(j => {
          j.status = 'queued';
        }),
      );
      await database.write(async () => {
        await database.batch(updates);
      });
    }

    const jobs = await Job.getAllJobs();
    const jobsRecord: Record<string, JobPayload> = {};

    for (const job of jobs) {
      jobsRecord[job.jobId] = job;
    }

    dispatch(setJobs(jobsRecord));
    dispatch(processJobsQueue());
  },
);

export const queueChapterDownload = createAsyncThunk<
  void,
  QueueDownloadChapterPayload,
  AppAsyncThunkConfig
>('jobs/queueDownload', async (payload, {dispatch}) => {
  const {manga, chapter} = payload;
  const jobId = `${manga.id}-${chapter.id}`;
  const existingJob = await Job.getJobById(jobId);

  if (existingJob) return;

  const mangaTitle = await manga.getPreferredTitle();
  const newJobPayload: JobPayload = {
    jobId,
    progress: 0,
    isDataSaver: manga.isDataSaver ?? false,
    status: 'queued',
    manga: {
      id: manga.id,
      title: mangaTitle,
    },
    chapter: {
      id: chapter.id,
      translatedLanguage: chapter.translatedLanguage,
      totalPages: chapter.pages,
      title: chapter.title ?? `Chapter ${chapter.chapterNumber ?? '0'}`,
      chapterNumber: chapter.chapterNumber ?? '0',
    },
    createdAt: Date.now(),
  };

  await Job.createJob(newJobPayload);
  dispatch(addJob(newJobPayload));
  dispatch(processJobsQueue());
});

export const deleteChapterJob = createAsyncThunk<
  void,
  {mangaId: string; chapterId: string},
  AppAsyncThunkConfig
>('jobs/deleteChapter', async ({mangaId, chapterId}, {dispatch}) => {
  const jobId = `${mangaId}-${chapterId}`;
  const job = await Job.getJobById(jobId);
  const chapter = await Chapter.getChapterById(chapterId);

  if (!chapter) {
    console.error('Chapter not found for deletion.');
    return;
  }

  const chapterDownloadDirectory = `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.translatedLanguage}/${chapter.id}`;

  try {
    if (await FS.exists(chapterDownloadDirectory)) {
      await FS.unlink(chapterDownloadDirectory);
    }

    const updates: Model[] = [];
    updates.push(
      chapter.prepareUpdate(chap => {
        chap._isDownloaded = false;
        chap._fileNames = [];
      }),
    );

    if (job) updates.push(job.prepareDestroyPermanently());

    await database.write(async () => {
      await database.batch(updates);
    });

    dispatch(removeJob(jobId));
    console.log(`Successfully deleted download for chapter: ${chapterId}`);
  } catch (error) {
    console.error('Failed to delete downloaded chapter:', error);
  }
});

export const cacheChapterJob = createAsyncThunk<
  CacheChapterResult,
  CacheChapterProps,
  AppAsyncThunkConfig
>('jobs/cacheChapter', async props => {
  const {chapter, mangaId, isDataSaver} = props;
  const cachedChapterDirectory = `${FS.CachesDirectoryPath}/${mangaId}/${chapter.id}`;

  const chapterData = await mangadexAPI<res_at_home_$, {}>('get', '/at-home/server/$', {}, [
    chapter.id,
  ]);
  if (chapterData.result !== 'ok') {
    console.error('Failed to cache chapter:', chapter.id);
    throw new Error('Failed to fetch chapter data for caching');
  }

  if (!(await FS.exists(cachedChapterDirectory))) {
    await FS.mkdir(cachedChapterDirectory);
  }

  const pagesToCache = isDataSaver ? chapterData.chapter.dataSaver : chapterData.chapter.data;
  const baseUrlSegment = isDataSaver ? 'data-saver' : 'data';

  const pageDownloads = pagesToCache.map(pageId => {
    const pageUrl = `${chapterData.baseUrl}/${baseUrlSegment}/${chapterData.chapter.hash}/${pageId}`;
    const localPath = `${cachedChapterDirectory}/${pageId}`;
    const {promise} = FS.downloadFile({fromUrl: pageUrl, toFile: localPath});
    return {
      pagePromise: promise,
      path: `file://${localPath}`,
    };
  });

  const dbChapter = await Chapter.getChapterById(chapter.id);
  await Promise.allSettled(pageDownloads.map(p => p.pagePromise));
  await dbChapter?.updateForDownload(isDataSaver, false, pagesToCache);

  return {pageDownloads, chapterData};
});

// MARK: SLICE
export const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    addJob: (state, action: PayloadAction<JobPayload>) => {
      state.jobs[action.payload.jobId] = action.payload;
    },
    updateJob: (state, action: PayloadAction<{jobId: string; updates: Partial<JobPayload>}>) => {
      const {jobId, updates} = action.payload;
      if (state.jobs[jobId]) {
        state.jobs[jobId] = {...state.jobs[jobId], ...updates};
      }
    },
    removeJob: (state, action: PayloadAction<string>) => {
      delete state.jobs[action.payload];
    },
    setJobs: (state, action: PayloadAction<Record<string, JobPayload>>) => {
      state.jobs = action.payload;
    },
  },
});

export const {addJob, updateJob, removeJob, setJobs} = jobsSlice.actions;
export const selectJobs = (state: RootState) => state.jobs.jobs;
export default jobsSlice.reducer;
