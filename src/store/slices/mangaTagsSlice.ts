import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '@store';
import {mangadexAPI, res_get_manga_tag} from '@api';
import {Tag} from '@db';
import {database} from '@db';
import {transformTags} from '@utils';
import {AppAsyncThunkConfig} from '../types';

const initialState: {tags: res_get_manga_tag['data'] | null} = {tags: null};

export const initializeMangaTags = createAsyncThunk<void, void, AppAsyncThunkConfig>(
  'tags',
  async (_, {dispatch, fulfillWithValue, rejectWithValue}) => {
    const localTags = await Tag.getAllTags();

    if (localTags.length === 0) {
      const apiTags = await mangadexAPI<res_get_manga_tag, {}>('get', '/manga/tag', {}, []);

      if (apiTags.result !== 'ok') {
        return rejectWithValue({title: 'Failed fetching tags', description: apiTags.result});
      }

      try {
        const tagsCollection = database.collections.get<Tag>('tags');
        const batchActions = apiTags.data.map(tagData => {
          return tagsCollection.prepareCreate(tag => {
            tag._raw.id = tagData.id;
            tag.tagId = tagData.id;
            tag.group = tagData.attributes.group;
            tag.version = tagData.attributes.version;
            tag.name = tagData.attributes.name;
          });
        });

        await database.write(async () => {
          return await database.batch(batchActions);
        });

        dispatch(setMangaTags(apiTags['data']));
        return fulfillWithValue(undefined);
      } catch (error) {
        console.log(error);
        return rejectWithValue({title: 'Database Error', description: 'Failed saving tags'});
      }
    }

    const transformedTags = transformTags(localTags);
    dispatch(setMangaTags(transformedTags));
    return fulfillWithValue(undefined);
  },
);

export const mangaTagsSlice = createSlice({
  name: 'mangaTags',
  initialState: initialState,
  reducers: {
    setMangaTags: (state, action: PayloadAction<res_get_manga_tag['data']>) => {
      state.tags = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(initializeMangaTags.pending, () => {
      console.log('started fetching tags');
    });
    builder.addCase(initializeMangaTags.fulfilled, () => {
      console.log('successfully fetched tags');
    });
    builder.addCase(initializeMangaTags.rejected, (_, action) => {
      // console.error('failed fetching tags');
      // console.error(`${action.payload?.title}`);
      // console.error(`${action.payload?.title}`);
    });
  },
});

export const {setMangaTags} = mangaTagsSlice.actions;
export const mangaTags = (state: RootState) => state.mangaTags;
export default mangaTagsSlice.reducer;
