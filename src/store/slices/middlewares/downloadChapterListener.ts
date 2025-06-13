import {createListenerMiddleware, TypedStartListening} from '@reduxjs/toolkit';
import {AppDispatch, RootState} from 'src/store/store';
import {downloadChapter, queueDownloadChapter, processDownloadQueue} from '../jobsSlice';

export const downloadListenerMiddleWare = createListenerMiddleware();

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
export const startAppListening = downloadListenerMiddleWare.startListening as AppStartListening;

startAppListening({
  actionCreator: queueDownloadChapter,
  effect: async (action, listenerApi) => {
    console.log(`${action.payload.chapter.id} queued for download`);
    listenerApi.dispatch(processDownloadQueue());
  },
});

startAppListening({
  actionCreator: downloadChapter.fulfilled,
  effect: async (action, listenerApi) => {
    console.log(`${action.meta.arg.chapter.id} has succeeded downloading`);
    listenerApi.dispatch(processDownloadQueue());
  },
});

startAppListening({
  actionCreator: downloadChapter.rejected,
  effect: async (action, listenerApi) => {
    console.log(`${action.meta.arg.chapter.id} has failed to download`);
    listenerApi.dispatch(processDownloadQueue());
  },
});
