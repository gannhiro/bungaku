import {createSlice} from '@reduxjs/toolkit';
import {PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '../store';

const initialState: {libraryList: string[]} = {libraryList: []};

export const libraryListSlice = createSlice({
  name: 'libraryList',
  initialState: initialState,
  reducers: {
    setLibraryList: (state, action: PayloadAction<string[]>) => {
      state.libraryList = action.payload;
    },
    addRemToLibraryList: (state, action: PayloadAction<string>) => {
      const inLibrary = state.libraryList.indexOf(action.payload);
      if (inLibrary === -1) {
        state.libraryList.push(action.payload);
      } else {
        state.libraryList.splice(inLibrary, 1);
      }
    },
  },
});

export const {setLibraryList, addRemToLibraryList} = libraryListSlice.actions;
export const libraryList = (state: RootState) => state.libraryList;
export default libraryListSlice.reducer;
