import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '../store';
import {UpdatedMangaData} from '@types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee from '@notifee/react-native';

const initialState: {updatedMangaList: UpdatedMangaData[]} = {
  updatedMangaList: [],
};

type RmLibraryUpdateAsyncProps = {
  mangaId: string;
};

export const rmLibraryUpdateAsync = createAsyncThunk<
  void,
  RmLibraryUpdateAsyncProps,
  {state: RootState}
>('libraryUpdates/rmLibraryUpdate', async ({mangaId}, {getState, dispatch}) => {
  const finalList = getState().libraryUpdates.updatedMangaList.filter(
    update => update.mangaId !== mangaId,
  );
  await AsyncStorage.setItem('library-updates', JSON.stringify(finalList));
  dispatch(setLibraryUpdates(finalList));
});

export const libraryUpdatesSlice = createSlice({
  name: 'libraryUpdates',
  initialState: initialState,
  reducers: {
    setLibraryUpdates: (state, action: PayloadAction<UpdatedMangaData[]>) => {
      state.updatedMangaList = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(rmLibraryUpdateAsync.fulfilled, (state, action) => {});
  },
});

export const {setLibraryUpdates} = libraryUpdatesSlice.actions;
export const libraryUpdates = (state: RootState) => state.libraryList;
export default libraryUpdatesSlice.reducer;
