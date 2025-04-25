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
import { createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
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

const MAX_CONCURRENT_DOWNLOADS = 3
const initialState: {
  jobs: Record<string, JobStatus>;
  downloadQueue: DownloadQueueItem[];
  activeDownloadsCount: number;
} = {
  jobs: {},
  downloadQueue: [],
  activeDownloadsCount: 0,
};

// MARK: Types

type JobStatus = {
  status: 'pending' | 'succeeded' | 'failed' | 'queued';
  jobType: 'downloadChapter' | 'cacheChapter';
  progress?: number;
  error?: string;
};

type DownloadQueueItem = {
  chapter: res_get_manga_$_feed['data'][0];
  mangaId: string;
  isDataSaver: boolean;
  isAnUpdate?: boolean;
  jobId: string;
};

type CacheChapterCallbackData = {
  path: string;
  pagePromise: Promise<FS.DownloadResult>;
};

type DownloadChapterProps = {
  chapter: res_get_manga_$_feed['data'][0];
  mangaId: string;
  isDataSaver: boolean;
  isAnUpdate?: boolean;
};

type CacheChapterProps = {
  chapter: res_get_manga_$_feed['data'][0];
  mangaId: string;
  isDataSaver: boolean;
  callback: (
    tempPages: {pagePromise?: Promise<FS.DownloadResult>; path: string}[],
    tempChapters: res_at_home_$,
  ) => void;
};

// MARK: Thunks

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
    {rejectWithValue, fulfillWithValue},
  ) => {
    let mangaDetails: MangaDetails | null = null;
    try {
        mangaDetails = JSON.parse(
          await FS.readFile(
            `${FS.DocumentDirectoryPath}/manga/${mangaId}/manga-details.json`,
          ),
        );
    } catch (e) {
        return rejectWithValue(`Failed to read manga details for ${mangaId}`);
    }

    if (!mangaDetails || !mangaDetails.stayUpdated) {
      return rejectWithValue(`${mangaId} details not found or should not stay updated.`);
    }

    const {
      manga,
      stayUpdatedAfterDate,
      stayUpdatedLanguages,
      isDataSaver,
    } = mangaDetails;

    const chapters: res_get_manga_$_feed['data'] = [];
    const limit = 500;
    let offset = 0;
    let totalChapters = 0;
    try {
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
            totalChapters = chapterData.total;
            if (offset + limit < totalChapters) {
              offset += limit;
            } else {
              break;
            }
          } else if (chapterData.result === 'error'){
             console.error(`API error fetching chapters for ${mangaId}:`, chapterData.errors);
             break;
          } else {
             console.warn(`Unexpected API result for ${mangaId}:`, chapterData.result);
             break;
          }
        }
    } catch (e) {
       console.error(`Network or other error fetching chapters for ${mangaId}:`, e);
       return rejectWithValue(`Error fetching chapters for ${mangaId}`);
    }

    if (chapters.length === 0) {
      return rejectWithValue(`MANGA: ${mangaId} - No new chapters found since ${stayUpdatedAfterDate}.`);
    }

    let allChapterIds: string[] = [];
     try {
       for (const lang of stayUpdatedLanguages) {
         const langPath = `${FS.DocumentDirectoryPath}/manga/${mangaId}/${lang}`;
         if (await FS.exists(langPath)) {
             const chaptersDirList = await FS.readDir(langPath);
             allChapterIds.push(...chaptersDirList.map(dir => dir.name));
         }
       }
     } catch(e) {
         console.error(`Error reading existing chapter directories for ${mangaId}:`, e);
     }

    let chapterCount = chapters.filter((chapter) => !(
      allChapterIds.includes(chapter.id) || 
      chapter.attributes.pages === 0 ||
      chapter.attributes.externalUrl
    )).length

    if (chapterCount === 0) {
      return rejectWithValue(`MANGA: ${mangaId} - All new chapters already downloaded or invalid.`);
    }

     try {
         const mangaListNotifId = mangaId;
         await notifee.createChannel({
           id: `${mangaListNotifId}.updates-notif`,
           name: `${manga.attributes.title.en ?? mangaId}`,
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
             notificationId: `${mangaListNotifId}.updates-notif`,
           });
         } else {
           const oldCount = previousChaptersTracker[mangaIdExists].newChapterCount;
           previousChaptersTracker[mangaIdExists].newChapterCount = oldCount + chapterCount;
         }

         await AsyncStorage.setItem(
           'library-updates',
           JSON.stringify(previousChaptersTracker),
         );

         await notifee.displayNotification({
           id: `${mangaListNotifId}.updates-notif`,
           title: `${manga.attributes.title.en ?? mangaId} has new chapters.`,
           body: `${chapterCount} new chapters found and queued for download.`,
           android: {
             channelId: `${mangaListNotifId}.updates-notif`,
             badgeIconType: AndroidBadgeIconType.SMALL,
           },
         });
     } catch(e) {
         console.error(`Error handling notifications/storage for ${mangaId}:`, e);
     }

    return fulfillWithValue(`MANGA: ${mangaId} - ${chapterCount} chapters enqueued for update.`);
  },
);

export const processDownloadQueue = createAsyncThunk<void, void, { state: RootState }>(
  'jobs/processDownloadQueue',
  async (_, { getState, dispatch }) => {
    const state = getState().jobs;
    const { activeDownloadsCount, downloadQueue } = state;

    if (activeDownloadsCount < MAX_CONCURRENT_DOWNLOADS && downloadQueue.length > 0) {
      const nextJob = downloadQueue[0];
      dispatch(downloadChapter(nextJob));
    }
  }
);

export const downloadChapter = createAsyncThunk<
  { status: 'success' | 'failed' | 'aborted' | 'exists'; jobId: string },
  DownloadQueueItem,
  { rejectValue: { reason: string; jobId: string } }
>(
  'jobs/downloadChapter',
  async (
    {chapter, mangaId, isDataSaver, isAnUpdate = false, jobId}: DownloadQueueItem,
    {fulfillWithValue, rejectWithValue, signal, dispatch},
  ) => {
    dispatch(setJobStatus({ jobId, status: { status: 'pending', jobType: 'downloadChapter', progress: 0 } }));

    const chapterDirectory = `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.attributes.translatedLanguage}/${chapter.id}`;
    const cacheDirectory = `${FS.CachesDirectoryPath}/${mangaId}/${chapter.id}`;

    try {
        const chapterIsCached = await FS.exists(cacheDirectory);

        if (chapterIsCached) {
          await FS.moveFile(cacheDirectory, chapterDirectory);
          return fulfillWithValue({ status: 'success', jobId });
        }

        const chapterIsDownloaded = await FS.exists(chapterDirectory);

        if (chapterIsDownloaded && isAnUpdate) {
          return fulfillWithValue({ status: 'exists', jobId });
        }
        if (chapterIsDownloaded && !isAnUpdate) {
          await FS.unlink(chapterDirectory);
          return rejectWithValue({ reason: 'Chapter already downloaded', jobId });
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

        if (chapterData?.result === 'error') {
          dispatch(setError(chapterData));
          return rejectWithValue({ reason: `API Error: ${chapterData.errors[0].title}`, jobId });
        }
        if (signal?.aborted || chapterData?.result === 'aborted') {
          return fulfillWithValue({ status: 'aborted', jobId });
        }
         if (chapterData?.result !== 'ok') {
           return rejectWithValue({ reason: `API returned non-OK status: ${chapterData?.result}`, jobId });
         }

        const pageList = isDataSaver ? chapterData.chapter.dataSaver : chapterData.chapter.data;
        const baseUrlSegment = isDataSaver ? 'data-saver' : 'data';

        const chapterDetails: DownloadedChapterDetails = {
          chapter,
          pageFileNames: pageList,
          isDataSaver: isDataSaver,
        };

        await FS.mkdir(chapterDirectory);

        await FS.writeFile(
          `${chapterDirectory}/chapter.json`,
          JSON.stringify(chapterDetails),
        );

        let downloadedCount = 0;
        const totalPages = pageList.length;

        const promises = pageList.map(async data => {
          const { promise } = FS.downloadFile({
            fromUrl: `${chapterData.baseUrl}/${baseUrlSegment}/${chapterData.chapter.hash}/${data}`,
            toFile: `${chapterDirectory}/${data}`,
            progressDivider: 5,
          });
          return promise.then(() => {
              downloadedCount++;
              const currentProgress = downloadedCount / totalPages;
              console.log(currentProgress)
              dispatch(updateJobProgress({ jobId, progress: currentProgress }));
          });
        });

        const results = await Promise.allSettled(promises);

        const failedDownloads = results.filter(r => r.status === 'rejected');
        if (failedDownloads.length > 0) {
           await FS.unlink(chapterDirectory).catch(e => console.error(`Cleanup error for ${jobId}: ${e}`));;
           return rejectWithValue({ reason: `${failedDownloads.length} pages failed to download`, jobId });
        }

        return fulfillWithValue({ status: 'success', jobId });

    } catch (error: any) {
         await FS.unlink(chapterDirectory).catch(e => console.error(`Cleanup error after catch for ${jobId}: ${e}`));;
         return rejectWithValue({ reason: error?.message || 'Unknown download error', jobId });
    }
  },
);

export const cacheChapter = createAsyncThunk<
  { success: boolean; jobId: string },
  CacheChapterProps,
  { rejectValue: { reason: string; jobId: string } }
>(
  'jobs/cacheChapter',
  async (
    {chapter, mangaId, isDataSaver, callback}: CacheChapterProps,
    {fulfillWithValue, rejectWithValue, signal, dispatch},
  ) => {
    const jobId = `cache-${chapter.id}`;
    dispatch(setJobStatus({ jobId, status: { status: 'pending', jobType: 'cacheChapter', progress: 0 } }));

    const cacheDirectory = `${FS.CachesDirectoryPath}/${mangaId}/${chapter.id}`;
    try {
        const data = await mangadexAPI<res_at_home_$, {}>(
          'get',
          '/at-home/server/$',
          {},
          [chapter.id],
          undefined,
          signal
        );

        if (data.result === 'ok') {
           if (await FS.exists(cacheDirectory)) {
              await FS.unlink(cacheDirectory);
           }
          await FS.mkdir(cacheDirectory);

          const downloadedChapters = isDataSaver
            ? data.chapter.dataSaver
            : data.chapter.data;
           const baseUrlSegment = isDataSaver ? 'data-saver' : 'data';


          const chapterDetails: DownloadedChapterDetails = {
            chapter: chapter,
            pageFileNames: downloadedChapters,
            isDataSaver,
          };

          await FS.writeFile(
            `${cacheDirectory}/chapter.json`,
            JSON.stringify(chapterDetails),
          );

           const totalPages = downloadedChapters.length;

          const pagePromises: Promise<FS.DownloadResult>[] = downloadedChapters.map(pageId => {
            const pageUrl = `${data.baseUrl}/${baseUrlSegment}/${data.chapter.hash}/${pageId}`;
            const localPath = `${cacheDirectory}/${pageId}`;

            const { promise } = FS.downloadFile({
              fromUrl: pageUrl,
              toFile: localPath,
            });
            return promise;
          });

          const filePaths = downloadedChapters.map(pageId => `file://${cacheDirectory}/${pageId}`);

          callback(
             pagePromises.map((promise, index) => ({ path: filePaths[index], pagePromise: promise })),
             data
           );

          const results = await Promise.allSettled(pagePromises);

          const successfulDownloads = results.filter(r => r.status === 'fulfilled').length;
          const finalProgress = Math.floor((successfulDownloads / totalPages) * 100);
          dispatch(updateJobProgress({ jobId, progress: finalProgress }));

           const failedDownloads = results.filter(r => r.status === 'rejected');
           if (failedDownloads.length > 0) {
              await FS.unlink(cacheDirectory).catch(e => console.error(`Cleanup error for cache ${jobId}: ${e}`));
              dispatch(setJobStatus({ jobId, status: { status: 'failed', jobType: 'cacheChapter', error: `${failedDownloads.length} cache pages failed` } }));
              return rejectWithValue({ reason: `${failedDownloads.length} cache pages failed`, jobId });
           }

          dispatch(setJobStatus({ jobId, status: { status: 'succeeded', jobType: 'cacheChapter', progress: 100 } }));
          return fulfillWithValue({ success: true, jobId });

        } else if (signal?.aborted || data.result === 'aborted'){
             dispatch(setJobStatus({ jobId, status: { status: 'failed', jobType: 'cacheChapter', error: 'Aborted' } }));
             return rejectWithValue({ reason: 'Aborted', jobId });
        } else {
           dispatch(setJobStatus({ jobId, status: { status: 'failed', jobType: 'cacheChapter', error: data.result } }));
           if (data.result === 'error') dispatch(setError(data));
           return rejectWithValue({ reason: `API Error: ${data.result}`, jobId });
        }
    } catch (error: any) {
       await FS.unlink(cacheDirectory).catch(e => console.error(`Cleanup error after catch for cache ${jobId}: ${e}`));
       dispatch(setJobStatus({ jobId, status: { status: 'failed', jobType: 'cacheChapter', error: error?.message } }));
       return rejectWithValue({ reason: error?.message || 'Unknown cache error', jobId });
    }
  },
);

export const addOrRemoveFromLibrary = createAsyncThunk(
  'jobs/addRemToLibraryJob',
  async (
    mangaDetails: MangaDetails,
    {dispatch, rejectWithValue, fulfillWithValue},
  ) => {
     const { manga } = mangaDetails;
     const mangaDir = `${FS.DocumentDirectoryPath}/manga/${manga.id}`;
     try {
       const exists = await FS.exists(mangaDir);

       if (exists) {
         await FS.unlink(mangaDir);
         dispatch(addRemToLibraryList(manga.id));
         ToastAndroid.show('Removed from Library.', 1000);
         return fulfillWithValue({ status: 'removed', mangaId: manga.id });
       } else {
         await FS.mkdir(mangaDir);

         const coverRelationship = manga.relationships.find(
           rs => rs.type === 'cover_art',
         );
         const coverItem = (coverRelationship?.type === 'cover_art' ? coverRelationship : undefined) as res_get_cover_$['data'] | undefined;

         if (coverItem?.attributes.fileName) {
            const coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverItem.attributes.fileName}`;
            await FS.downloadFile({
              fromUrl: coverUrl,
              toFile: `${mangaDir}/cover.png`,
            }).promise.catch(e => console.error(`Failed to download cover for ${manga.id}: ${e}`));
         }

         const toFile: MangaDetails = {
           ...mangaDetails,
           dateAdded: getDateMDEX(),
         };
         await FS.writeFile(
           `${mangaDir}/manga-details.json`,
           JSON.stringify(toFile),
         );

         dispatch(addRemToLibraryList(manga.id));
         ToastAndroid.show('Added to Library.', 1000);
         return fulfillWithValue({ status: 'added', mangaId: manga.id });
       }
     } catch (e: any) {
       console.error(`Error adding/removing library item ${manga.id}: ${e}`);
       if (!(await FS.exists(mangaDir))) {
         await FS.unlink(mangaDir).catch(cleanupError => console.error(`Cleanup failed for ${manga.id}: ${cleanupError}`));
       }
       ToastAndroid.show('Library operation failed!', 1000);
       return rejectWithValue({ reason: e.message || 'Unknown library error', mangaId: manga.id });
     }
  },
);

// MARK: Slice

export const jobsSlice = createSlice({
  name: 'jobs',
  initialState: initialState,
  reducers: {
    queueDownloadChapter: (state, action: PayloadAction<Omit<DownloadQueueItem, 'jobId'>>) => {
      const potentialJobId = `${action.payload.mangaId}-${action.payload.chapter.id}`;
      const isInQueue = state.downloadQueue.some(item => item.chapter.id === action.payload.chapter.id);

      const isAlreadyProcessing = Object.keys(state.jobs).some(existingJobId => {
        if (existingJobId.startsWith(potentialJobId)) {
          const job = state.jobs[existingJobId];
          return job && (job.status === 'pending' || job.status === 'queued');
        }
        return false;
      });

      if (!isInQueue && !isAlreadyProcessing) {
         const jobId = `${potentialJobId}`;
         const newQueueItem: DownloadQueueItem = { ...action.payload, jobId };
         state.downloadQueue.push(newQueueItem);
         state.jobs[jobId] = { status: 'queued', jobType: 'downloadChapter', progress: 0, error: 'Queued' };
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
    setJobStatus: (state, action: PayloadAction<{ jobId: string; status: JobStatus }>) => {
      if (action.payload.status.jobType === 'downloadChapter' || action.payload.status.jobType === 'cacheChapter') {
          state.jobs[action.payload.jobId] = action.payload.status;
      }
    },
    updateJobProgress: (state, action: PayloadAction<{ jobId: string; progress: number }>) => {
      const { jobId, progress } = action.payload;
      const job = state.jobs[jobId];
      if (job && (job.jobType === 'downloadChapter' || job.jobType === 'cacheChapter')) {
          if (job.status === 'pending' || job.status === 'queued') {
            job.progress = Math.max(0, Math.min(100, progress));
            if (job.status === 'queued') job.status = 'pending';
            job.error = undefined;
          }
      }
    },
    clearJob: (state, action: PayloadAction<{ jobId: string }>) => {
      const { jobId } = action.payload;
      state.downloadQueue = state.downloadQueue.filter(item => item.jobId !== jobId);
      delete state.jobs[jobId];
    },
    clearFinishedJobs: (state) => {
      Object.keys(state.jobs).forEach(jobId => {
        const job = state.jobs[jobId];
        if (job && (job.jobType === 'downloadChapter' || job.jobType === 'cacheChapter')) {
            if (job.status === 'succeeded') {
               delete state.jobs[jobId];
            }
        }
      });
    },
    cancelDownload: (state, action: PayloadAction<{ jobId: string }>) => {
       const { jobId } = action.payload;
       const jobIndexInQueue = state.downloadQueue.findIndex(item => item.jobId === jobId);

       if (jobIndexInQueue > -1) {
         state.downloadQueue.splice(jobIndexInQueue, 1);
         if(state.jobs[jobId] && state.jobs[jobId].jobType === 'downloadChapter') {
            state.jobs[jobId].status = 'failed';
            state.jobs[jobId].error = 'Cancelled';
            state.jobs[jobId].progress = undefined;
         }
       } else {
         if(state.jobs[jobId] && (state.jobs[jobId].jobType === 'downloadChapter' || state.jobs[jobId].jobType === 'cacheChapter') && state.jobs[jobId].status === 'pending') {
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

        if (!state.jobs[jobId]) {
            state.jobs[jobId] = { status: 'pending', jobType: 'downloadChapter', progress: 0 };
        } else {
            state.jobs[jobId].status = 'pending';
            state.jobs[jobId].error = undefined;
        }

        if (jobInQueueIndex > -1) {
           state.activeDownloadsCount += 1;
           state.downloadQueue.splice(jobInQueueIndex, 1);
           console.log(`Download Starting: ${jobId}, Active: ${state.activeDownloadsCount}`);
        } else {
           state.activeDownloadsCount += 1;
           console.warn(`Download pending for job (${jobId}) not found in queue. Incrementing active count.`);
        }
      })
      .addCase(downloadChapter.fulfilled, (state, action) => {
        const { jobId, status } = action.payload;
        state.activeDownloadsCount = Math.max(0, state.activeDownloadsCount - 1);
        if (state.jobs[jobId]) {
           state.jobs[jobId].status = (status === 'success' || status === 'exists') ? 'succeeded' : 'failed';
           state.jobs[jobId].progress = 100;
           state.jobs[jobId].error = status === 'aborted' ? 'Aborted' : status === 'exists' ? 'Already downloaded' : undefined;
        }
         console.log(`Download Finished (Fulfilled): ${jobId}, Status: ${status}, Active: ${state.activeDownloadsCount}`);
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
         console.log(`Download Finished (Rejected): ${jobId}, Reason: ${reason}, Active: ${state.activeDownloadsCount}`);
      })
       .addCase(cacheChapter.pending, (state, action) => {
          // Job status handled by setJobStatus in thunk
       })
       .addCase(cacheChapter.fulfilled, (state, action) => {
          // Job status handled by setJobStatus in thunk
       })
       .addCase(cacheChapter.rejected, (state, action) => {
          // Job status handled by setJobStatus in thunk
       })
      ;
  },
});

export const {
  queueDownloadChapter,
  updateJobProgress,
  setJobStatus,
  clearJob,
  clearFinishedJobs,
  cancelDownload
} = jobsSlice.actions;

export const selectJobsState = (state: RootState) => state.jobs;
export const selectJobsMap = (state: RootState) => state.jobs.jobs;
export default jobsSlice.reducer;