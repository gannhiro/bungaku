import {configureStore} from '@reduxjs/toolkit';
import userPreferencesSlice from './slices/userPreferencesSlice';
import mangaTagsSlice from './slices/mangaTagsSlice';
import userSlice from './slices/userSlice';
import errorSlice from './slices/errorSlice';
import libraryListSlice from './slices/libraryListSlice';
import jobsSlice from './slices/jobsSlice';
import libraryUpdates from './slices/libraryUpdates';

export const store = configureStore({
  reducer: {
    jobs: jobsSlice,
    libraryList: libraryListSlice,
    libraryUpdates: libraryUpdates,
    userPreferences: userPreferencesSlice,
    mangaTags: mangaTagsSlice,
    user: userSlice,
    error: errorSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
