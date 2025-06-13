import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '../store';
import {MangaDetails} from '@types';
import {ToastAndroid} from 'react-native';
import FS from 'react-native-fs';
import {res_get_cover_$} from '@api';
import {getDateTodayAtMidnight} from '@utils';
import {AppAsyncThunkConfig} from '../types';

const initialState: {libraryList: string[]} = {libraryList: []};

export const addOrRemoveMangaFromLibrary = createAsyncThunk<
  string,
  MangaDetails,
  AppAsyncThunkConfig
>(
  'jobs/addRemToLibraryJob',
  async (mangaDetails, {dispatch, rejectWithValue, fulfillWithValue}) => {
    const {manga} = mangaDetails;
    const mangaDirectory = `${FS.DocumentDirectoryPath}/manga/${manga.id}`;

    try {
      const mangaExists = await FS.exists(mangaDirectory);

      if (mangaExists) {
        await FS.unlink(mangaDirectory);
        dispatch(removeMangaIdFromLibraryList(manga.id));
        ToastAndroid.show('Removed from Library.', 1000);
        return fulfillWithValue(`success`);
      } else {
        await FS.mkdir(mangaDirectory);

        const coverRelationship = manga.relationships.find(rs => rs.type === 'cover_art');
        const coverItem = (
          coverRelationship?.type === 'cover_art' ? coverRelationship : undefined
        ) as res_get_cover_$['data'] | undefined;

        if (coverItem?.attributes.fileName) {
          const coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverItem.attributes.fileName}`;
          await FS.downloadFile({
            fromUrl: coverUrl,
            toFile: `${mangaDirectory}/cover.png`,
          }).promise.catch(e => console.error(`Failed to download cover for ${manga.id}: ${e}`));
        }

        const toFile: MangaDetails = {
          ...mangaDetails,
          dateAdded: getDateTodayAtMidnight(),
        };

        await FS.writeFile(`${mangaDirectory}/manga-details.json`, JSON.stringify(toFile));

        dispatch(addMangaIdLibraryList(manga.id));

        return fulfillWithValue(``);
      }
    } catch (e: any) {
      console.error(`Error adding/removing library item ${manga.id}: ${e}`);

      if (!(await FS.exists(mangaDirectory))) {
        await FS.unlink(mangaDirectory).catch(cleanupError =>
          console.error(`Cleanup failed for ${manga.id}: ${cleanupError}`),
        );
      }

      ToastAndroid.show('Library operation failed!', 1000);

      return rejectWithValue(``);
    }
  },
);

export const libraryListSlice = createSlice({
  name: 'libraryList',
  initialState: initialState,
  reducers: {
    setLibraryList: (state, action: PayloadAction<string[]>) => {
      state.libraryList = action.payload;
    },
    addMangaIdLibraryList: (state, action: PayloadAction<string>) => {
      const inLibrary = state.libraryList.indexOf(action.payload);

      if (inLibrary === -1) {
        state.libraryList.push(action.payload);
        ToastAndroid.show('Added to library.', 1000);
      }
    },
    removeMangaIdFromLibraryList: (state, action: PayloadAction<string>) => {
      const inLibrary = state.libraryList.indexOf(action.payload);

      if (inLibrary !== -1) {
        state.libraryList.splice(inLibrary, 1);
        ToastAndroid.show('Removed from library.', 1000);
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(addOrRemoveMangaFromLibrary.pending, (state, action) => {})
      .addCase(addOrRemoveMangaFromLibrary.fulfilled, (state, action) => {})
      .addCase(addOrRemoveMangaFromLibrary.rejected, (state, action) => {});
  },
});

export const {setLibraryList, addMangaIdLibraryList, removeMangaIdFromLibraryList} =
  libraryListSlice.actions;
export const libraryList = (state: RootState) => state.libraryList;
export default libraryListSlice.reducer;
