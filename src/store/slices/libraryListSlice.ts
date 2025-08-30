import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {database, Manga} from '@db';
import {AppAsyncThunkConfig} from '../types';
import {Q} from '@nozbe/watermelondb';

let librarySubscription: {unsubscribe: () => void} | undefined;

const initialState: {libraryList: string[]} = {libraryList: []};

export const initializeLibraryObserver = createAsyncThunk<void, void, AppAsyncThunkConfig>(
  'library/initializeObserver',
  async (_, {dispatch}) => {
    if (librarySubscription) {
      return;
    }

    const mangaCollection = database.get<Manga>('mangas');
    const libraryQuery = mangaCollection.query(Q.where('stay_updated', Q.notEq(null)));

    librarySubscription = libraryQuery.observe().subscribe(libraryMangas => {
      const mangaIds = libraryMangas.map(m => m.mangaId);
      dispatch(setLibraryList(mangaIds));
    });
  },
);

export const libraryListSlice = createSlice({
  name: 'libraryList',
  initialState: initialState,
  reducers: {
    setLibraryList: (state, action: PayloadAction<string[]>) => {
      state.libraryList = action.payload;
    },
  },
});

export const {setLibraryList} = libraryListSlice.actions;
export default libraryListSlice.reducer;
