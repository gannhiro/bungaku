import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {UpdatedMangaNotifications} from '@types';
import type {RootState} from '../store';

export const UPDATE_PREFIX = 'BUNGAKU_UPDATE_';

const initialState: {updatedMangaList: UpdatedMangaNotifications} = {
  updatedMangaList: {},
};

type UpdateLibraryUpdateProps = {
  mangaId: string;
  updateInfo: UpdatedMangaNotifications[string];
};

export const initializeLibraryUpdates = createAsyncThunk<void, void, {}>(
  'libraryUpdates/initialize',
  async (_, {dispatch}) => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const updateKeys = allKeys.filter(key => key.startsWith(UPDATE_PREFIX));
      const finalUpdates: UpdatedMangaNotifications = {};

      if (updateKeys.length > 0) {
        const allUpdatePairs = await AsyncStorage.multiGet(updateKeys);

        for (const [key, value] of allUpdatePairs) {
          if (key && value) {
            const mangaId = key.substring(UPDATE_PREFIX.length);
            finalUpdates[mangaId] = JSON.parse(value);
          }
        }
      }

      dispatch(setLibraryUpdates(finalUpdates));
    } catch (error) {
      console.error('Failed to initialize library updates:', error);
    }
  },
);

export const addLibraryUpdate = createAsyncThunk<void, UpdateLibraryUpdateProps, {}>(
  'libraryUpdates/addLibraryUpdate',
  async ({mangaId, updateInfo}, {dispatch}) => {
    await AsyncStorage.setItem(`${UPDATE_PREFIX}${mangaId}`, JSON.stringify(updateInfo));
    dispatch(setOrUpdateMangaUpdate({mangaId, updateInfo}));
  },
);

export const removeLibraryUpdateNotifs = createAsyncThunk<void, string, {state: RootState}>(
  'libraryUpdates/removeLibraryUpdateNotifs',
  async (mangaId, {getState, dispatch}) => {
    const currentUpdates = getState().libraryUpdates.updatedMangaList;

    if (currentUpdates[mangaId]) {
      notifee.cancelDisplayedNotification(currentUpdates[mangaId].notificationId);
      await AsyncStorage.removeItem(`${UPDATE_PREFIX}${mangaId}`);
      dispatch(removeMangaUpdate(mangaId));
    }
  },
);

export const libraryUpdatesSlice = createSlice({
  name: 'libraryUpdates',
  initialState: initialState,
  reducers: {
    setLibraryUpdates: (state, action: PayloadAction<UpdatedMangaNotifications>) => {
      state.updatedMangaList = action.payload;
    },
    setOrUpdateMangaUpdate: (state, action: PayloadAction<UpdateLibraryUpdateProps>) => {
      const {mangaId, updateInfo} = action.payload;
      state.updatedMangaList[mangaId] = updateInfo;
    },
    removeMangaUpdate: (state, action: PayloadAction<string>) => {
      delete state.updatedMangaList[action.payload];
    },
  },
});

export const {setLibraryUpdates, setOrUpdateMangaUpdate, removeMangaUpdate} =
  libraryUpdatesSlice.actions;
export const libraryUpdates = (state: RootState) => state.libraryList;
export default libraryUpdatesSlice.reducer;
