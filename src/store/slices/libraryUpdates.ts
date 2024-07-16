import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '../store';
import {UpdatedMangaData} from '@types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState: UpdatedMangaData[] = [];

type RmLibraryUpdateAsyncProps = {
  mangaId: string;
};

export const rmLibraryUpdateAsync = createAsyncThunk<
  void,
  RmLibraryUpdateAsyncProps,
  {state: RootState}
>('libraryUpdates/rmLibraryUpdate', async ({mangaId}, {getState}) => {
  const libraryUpdates = getState().libraryUpdates;
  const index = libraryUpdates.findIndex(val => val.mangaId === mangaId);
  libraryUpdates.splice(index, 1);
  await AsyncStorage.setItem('library-updates', JSON.stringify(libraryUpdates));
});

export const libraryUpdatesSlice = createSlice({
  name: 'libraryUpdates',
  initialState: initialState,
  reducers: {
    setLibraryUpdates: (state, action: PayloadAction<UpdatedMangaData[]>) => {
      state = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(rmLibraryUpdateAsync.fulfilled, (state, action) => {
      const index = state.findIndex(
        val => val.mangaId === action.meta.arg.mangaId,
      );
      state.splice(index, 1);
    });
  },
});

export const {setLibraryUpdates} = libraryUpdatesSlice.actions;
export const libraryUpdates = (state: RootState) => state.libraryList;
export default libraryUpdatesSlice.reducer;
