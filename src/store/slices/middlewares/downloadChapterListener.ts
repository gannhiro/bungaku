import { createListenerMiddleware, TypedStartListening } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from 'src/store/store';
import { downloadChapter, enqueueDownload, processDownloadQueue } from '../jobsSlice';

export const downloadListenerMiddleWare = createListenerMiddleware();

// Define typed versions of startListening
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
export const startAppListening = downloadListenerMiddleWare.startListening as AppStartListening;

startAppListening({
    actionCreator: enqueueDownload,
    effect: async (action, listenerApi) => {
      console.log('Listener saw enqueueDownload, dispatching processDownloadQueue...');
    },
  });
  
  // Listener 2: Trigger queue processing when a download finishes (fulfilled)
  startAppListening({
    actionCreator: downloadChapter.fulfilled, // Listen for fulfilled action
    effect: async (action, listenerApi) => {
      console.log(`Listener saw downloadChapter fulfilled (${action.payload}), dispatching processDownloadQueue...`);
    },
  });
  
  // Listener 3: Trigger queue processing when a download finishes (rejected)
  startAppListening({
    actionCreator: downloadChapter.rejected, // Listen for rejected action
    effect: async (action, listenerApi) => {
      // Access payload/meta if needed: action.payload?.jobId, action.meta.arg.jobId
      const jobId = action.payload || action.meta.arg.chapter.id;
      console.log(`Listener saw downloadChapter rejected (${jobId}), dispatching processDownloadQueue...`);
    },
  });