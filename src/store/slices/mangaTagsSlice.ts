import {createSlice} from '@reduxjs/toolkit';
import {PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '../store';
import {res_get_manga_tag} from '../../api/types';

const initialState: {tags: res_get_manga_tag | null} = {tags: null};

export const mangaTagsSlice = createSlice({
  name: 'mangaTags',
  initialState: initialState,
  reducers: {
    setMangaTags: (state, action: PayloadAction<res_get_manga_tag>) => {
      state.tags = action.payload;
    },
  },
});

export const {setMangaTags} = mangaTagsSlice.actions;
export const mangaTags = (state: RootState) => state.mangaTags;
export default mangaTagsSlice.reducer;
