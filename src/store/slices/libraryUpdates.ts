import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {UpdatedMangaNotifications} from '@types';
import type {RootState} from '../store';

const initialState: {updatedMangaList: UpdatedMangaNotifications[]} = {
  updatedMangaList: [],
};

type RemoveLibraryUpdateProps = {
  mangaId: string;
};

export const removeLibraryUpdateNotifs = createAsyncThunk<
  void,
  RemoveLibraryUpdateProps,
  {state: RootState}
>(
  'libraryUpdates/removeLibraryUpdateNotifs',
  async ({mangaId}, {getState, dispatch}) => {
    const updatedMangaList = getState().libraryUpdates.updatedMangaList;
    const finalList = updatedMangaList.filter(update => {
      const shouldRemoveId = update.mangaId !== mangaId;

      if (shouldRemoveId) {
        notifee.cancelNotification(update.notificationId);
      }

      return shouldRemoveId;
    });

    await AsyncStorage.setItem('library-updates', JSON.stringify(finalList));
    dispatch(setLibraryUpdatesOnLaunch(finalList));
  },
);

export const libraryUpdatesSlice = createSlice({
  name: 'libraryUpdates',
  initialState: initialState,
  reducers: {
    setLibraryUpdatesOnLaunch: (
      state,
      action: PayloadAction<UpdatedMangaNotifications[]>,
    ) => {
      state.updatedMangaList = action.payload;
    },
  },
});

export const {setLibraryUpdatesOnLaunch} = libraryUpdatesSlice.actions;
export const libraryUpdates = (state: RootState) => state.libraryList;
export default libraryUpdatesSlice.reducer;
