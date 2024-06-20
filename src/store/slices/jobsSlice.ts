import {
  mangadexAPI,
  res_at_home_$,
  res_get_cover_$,
  res_get_manga,
  res_get_manga_$_feed,
  res_get_statistics_manga,
} from '@api';
import {PayloadAction, createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {ChapterDetails, MangaDetails} from '@types';
import {getDateMDEX} from '@utils';
import {ToastAndroid} from 'react-native';
import FS from 'react-native-fs';
import type {RootState} from '../store';
import {addRemToLibraryList} from './libraryListSlice';

const initialState: string[] = [];

type ChapterDLJobProps = {
  chapter: res_get_manga_$_feed['data'][0];
  manga: res_get_manga['data'][0];
  statistics: res_get_statistics_manga | null;
};

export const updateMangaSettingsJob = createAsyncThunk(
  'jobs/updateMangaSettingsJob',
  async ({
    manga,
    statistics,
    stayUpdated,
    stayUpdatedAfterDate,
    stayUpdatedLanguages,
  }: MangaDetails) => {
    // write to manga-details.json
    console.log('writing to manga-details.json');
    const toFile: MangaDetails = {
      manga,
      statistics,
      stayUpdated,
      stayUpdatedAfterDate,
      stayUpdatedLanguages,
      dateAdded: getDateMDEX(),
    };
    await FS.writeFile(
      `${FS.DocumentDirectoryPath}/manga/${manga.id}/manga-details.json`,
      JSON.stringify(toFile),
    );
    ToastAndroid.show('Updated Settings.', 500);
  },
);

export const chapterDLJob = createAsyncThunk(
  'jobs/chapterDLJob',
  async ({chapter, manga}: ChapterDLJobProps, {fulfillWithValue}) => {
    // check for translated language folder
    const langFolderExists = await FS.exists(
      `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.attributes.translatedLanguage}`,
    );
    if (!langFolderExists) {
      await FS.mkdir(
        `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.attributes.translatedLanguage}`,
      );
    }

    // check if chapter id exists for removal
    const chapterExists = await FS.exists(
      `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.attributes.translatedLanguage}/${chapter.id}`,
    );

    if (chapterExists) {
      // remove chapter
      await FS.unlink(
        `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.attributes.translatedLanguage}/${chapter.id}`,
      );

      ToastAndroid.show('Removed Chapter.', 1000);
      return;
    }

    // download chapter details
    const chapterData = await mangadexAPI<res_at_home_$, {}>(
      'get',
      '/at-home/server/$',
      {},
      [chapter.id],
    );

    if (chapterData?.result === 'ok') {
      // write details to file
      const chapterDetails: ChapterDetails = {
        chapter,
        pageFileNames: chapterData.chapter.data,
      };

      await FS.mkdir(
        `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.attributes.translatedLanguage}/${chapter.id}`,
      );

      await FS.writeFile(
        `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.attributes.translatedLanguage}/${chapter.id}/chapter.json`,
        JSON.stringify(chapterDetails),
      );

      // download pages
      try {
        for (let i = 0; i < chapterData.chapter.data.length; i++) {
          const {promise} = FS.downloadFile({
            fromUrl: `${chapterData.baseUrl}/data/${chapterData.chapter.hash}/${chapterData.chapter.data[i]}`,
            toFile: `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.attributes.translatedLanguage}/${chapter.id}/${chapterData.chapter.data[i]}`,
          });

          const result = await promise;
          console.log(`${result.jobId}: ${result.statusCode}`);
        }
      } catch (e) {
        console.error(e);
        console.error('Error Downloading Chapter');

        ToastAndroid.show('Error Downloading Chapter!', 1000);

        // delete chapter folder
        await FS.unlink(
          `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.attributes.translatedLanguage}/${chapter.id}`,
        );

        console.log('deleted chapter');
      }
      console.log('finished downloading chapter');
    }

    return fulfillWithValue('success');
  },
);

export const addRemToLibraryJob = createAsyncThunk(
  'jobs/addRemToLibraryJob',
  async (
    {
      statistics,
      manga,
      stayUpdated,
      stayUpdatedAfterDate,
      stayUpdatedLanguages,
    }: MangaDetails,
    {dispatch},
  ) => {
    console.log('read from manga-list.json');
    const mangaList: string[] = JSON.parse(
      await FS.readFile(`${FS.DocumentDirectoryPath}/manga/manga-list.json`),
    );
    try {
      //check first if manga is in library
      const inLibrary = mangaList.some(id => id === manga.id);

      if (inLibrary) {
        // remove from list
        console.log('removing from library');
        mangaList.splice(mangaList.indexOf(manga.id), 1);
        await FS.unlink(`${FS.DocumentDirectoryPath}/manga/${manga.id}`);
        dispatch(addRemToLibraryList(manga.id));
        ToastAndroid.show('Removed from Library.', 1000);
        console.log('removed from library');
      } else {
        // add to the list
        console.log('adding to library');
        mangaList.push(manga.id);

        // make directory
        console.log(`making directory: ${manga.id}`);
        await FS.mkdir(`${FS.DocumentDirectoryPath}/manga/${manga.id}/`);

        // make lang dirs
        for (const lang of manga.attributes.availableTranslatedLanguages) {
          await FS.mkdir(
            `${FS.DocumentDirectoryPath}/manga/${manga.id}/${lang}`,
          );
        }

        // download cover art
        console.log('downloading cover art');
        const coverItem = manga.relationships.find(
          rs => rs.type === 'cover_art',
        ) as res_get_cover_$['data'] | undefined;
        const coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverItem?.attributes.fileName}`;
        const {promise} = FS.downloadFile({
          fromUrl: coverUrl,
          toFile: `${FS.DocumentDirectoryPath}/manga/${manga.id}/cover.png`,
        });
        const result = await promise;
        console.log(`cover_art download ${result.jobId}: ${result.statusCode}`);

        // write to manga-details.json
        console.log('writing to manga-details.json');
        const toFile: MangaDetails = {
          manga,
          statistics,
          stayUpdated,
          stayUpdatedAfterDate,
          stayUpdatedLanguages,
          dateAdded: getDateMDEX(),
        };
        await FS.writeFile(
          `${FS.DocumentDirectoryPath}/manga/${manga.id}/manga-details.json`,
          JSON.stringify(toFile),
        );

        ToastAndroid.show('Added to Library.', 1000);
        dispatch(addRemToLibraryList(manga.id));
        console.log('finished SUCCESSFULLY ADDED TO LIST');
      }
    } catch (e) {
      // error adding to library
      console.error(e);
      console.error(`error adding to library: ${manga.id}`);

      ToastAndroid.show('Adding to Library failed!', 1000);

      mangaList.splice(mangaList.indexOf(manga.id), 1);
      await FS.unlink(`${FS.DocumentDirectoryPath}/manga/${manga.id}`);
      console.error('finished FAILED ADDING TO LIST');
    } finally {
      // write list to file
      await FS.writeFile(
        `${FS.DocumentDirectoryPath}/manga/manga-list.json`,
        JSON.stringify(mangaList),
      );
      console.log(`FINALIZED JOB: ${manga.id} - ${getDateMDEX()}`);
    }
  },
);

export const jobsSlice = createSlice({
  name: 'jobs',
  initialState: initialState,
  reducers: {
    addChapDLJob: (state, action: PayloadAction<string>) => {
      state.push(action.payload);
    },
    rmChapDLJob: (state, action: PayloadAction<string>) => {
      state.splice(state.indexOf(action.payload), 1);
    },
  },
  extraReducers(builder) {
    builder.addCase(chapterDLJob.pending, (state, action) => {
      console.log('chapterDLJob.pending: ' + action.meta.arg.chapter.id);
      state.push(action.meta.arg.chapter.id);
    });
    builder.addCase(chapterDLJob.fulfilled, (state, action) => {
      console.log('chapterDLJob.fulfilled:' + action.meta.arg.chapter.id);
      state.splice(state.indexOf(action.meta.arg.chapter.id), 1);
    });
    builder.addCase(addRemToLibraryJob.pending, (state, action) => {
      console.log('addRemToLibraryJob.pending:' + action.meta.arg.manga.id);
      state.push(action.meta.arg.manga.id);
    });
    builder.addCase(addRemToLibraryJob.fulfilled, (state, action) => {
      console.log('addRemToLibraryJob.fulfilled:' + action.meta.arg.manga.id);
      state.splice(state.indexOf(action.meta.arg.manga.id), 1);
    });
  },
});

export const {addChapDLJob, rmChapDLJob} = jobsSlice.actions;
export const jobs = (state: RootState) => state.jobs;
export default jobsSlice.reducer;
