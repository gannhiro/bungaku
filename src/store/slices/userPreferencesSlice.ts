import {createSlice} from '@reduxjs/toolkit';
import {PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '@store';
import {CONFIG, Config} from '../../../config';
import {ColorSchemeName, Language} from '@constants';
import {READING_MODES} from '@screens';

const initialState: Config = CONFIG;

export const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState: initialState,
  reducers: {
    setColorScheme: (state, action: PayloadAction<ColorSchemeName>) => {
      state.colorScheme = action.payload;
    },
    setPornographyVis: (state, action: PayloadAction<boolean>) => {
      state.allowPornography = action.payload;
    },
    setReadingMode: (state, action: PayloadAction<READING_MODES>) => {
      state.readingMode = action.payload;
    },
    setPreferSystemColor: (state, action: PayloadAction<boolean>) => {
      state.preferSystemColor = action.payload;
    },
    setDataSaver: (state, action: PayloadAction<boolean>) => {
      state.preferDataSaver = action.payload;
    },
    setInterfaceLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    setConfig: (state, action: PayloadAction<Config>) => {
      const {
        colorScheme,
        language,
        allowPornography,
        preferDataSaver,
        preferSystemColor,
        readingMode,
      } = action.payload;
      state.colorScheme = colorScheme;
      state.language = language;
      state.allowPornography = allowPornography;
      state.preferDataSaver = preferDataSaver;
      state.preferSystemColor = preferSystemColor;
      state.readingMode = readingMode;
    },
  },
});

export const {
  setConfig,
  setColorScheme,
  setReadingMode,
  setPreferSystemColor,
  setDataSaver,
  setPornographyVis,
  setInterfaceLanguage,
} = userPreferencesSlice.actions;
export const userPreferences = (state: RootState) => state.userPreferences;
export default userPreferencesSlice.reducer;
