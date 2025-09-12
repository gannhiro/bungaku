import {configureStore} from '@reduxjs/toolkit';
import userPreferencesSlice from './slices/userPreferencesSlice';
import mangaTagsSlice from './slices/mangaTagsSlice';
import userSlice from './slices/userSlice';
import errorSlice from './slices/errorSlice';
import jobsSlice from './slices/jobsSlice';
import libraryUpdates from './slices/libraryUpdates';
import libraryListSlice from './slices/libraryListSlice';

export const store = configureStore({
  reducer: {
    jobs: jobsSlice,
    libraryUpdates: libraryUpdates,
    userPreferences: userPreferencesSlice,
    mangaTags: mangaTagsSlice,
    user: userSlice,
    error: errorSlice,
    libraryList: libraryListSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
