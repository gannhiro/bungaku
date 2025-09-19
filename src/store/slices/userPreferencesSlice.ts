import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {PayloadAction} from '@reduxjs/toolkit';
import type {AppAsyncThunkConfig, RootState} from '@store';
import {CONFIG, Config} from '../../../config';
import {ColorSchemeName, Language} from '@constants';
import {READING_MODES} from '@screens';
import {UserPreference} from '@db';

const initialState: Config = CONFIG;

export const setColorSchemeAsync = createAsyncThunk<void, ColorSchemeName, AppAsyncThunkConfig>(
  'userPreferences/setColorSchemeAsync',
  async (colorScheme, {dispatch}) => {
    await UserPreference.setColorSchemeName(colorScheme);
    dispatch(setColorScheme(colorScheme));
  },
);

export const setPornographyVisAsync = createAsyncThunk<void, boolean, AppAsyncThunkConfig>(
  'userPreferences/setPornographyVisAsync',
  async (allowPornography, {dispatch}) => {
    await UserPreference.setAllowPornography(allowPornography);
    dispatch(setPornographyVis(allowPornography));
  },
);

export const setReadingModeAsync = createAsyncThunk<void, READING_MODES, AppAsyncThunkConfig>(
  'userPreferences/setReadingModeAsync',
  async (readingMode, {dispatch}) => {
    await UserPreference.setReadingMode(readingMode);
    dispatch(setReadingMode(readingMode));
  },
);

export const setDataSaverAsync = createAsyncThunk<void, boolean, AppAsyncThunkConfig>(
  'userPreferences/setDataSaverAsync',
  async (preferDataSaver, {dispatch}) => {
    await UserPreference.setPreferDataSaver(preferDataSaver);
    dispatch(setDataSaver(preferDataSaver));
  },
);

export const setMaxConcurrentDownloadsAsync = createAsyncThunk<void, number, AppAsyncThunkConfig>(
  'userPreferences/setMaxConcurrentDownloads',
  async (maxConcurrentDownloads, {dispatch}) => {
    await UserPreference.setMaxConcurrentDownloads(maxConcurrentDownloads);
    dispatch(setMaxConcurrentDownloads(maxConcurrentDownloads));
  },
);

export const setInterfaceLanguageAsync = createAsyncThunk<void, Language, AppAsyncThunkConfig>(
  'userPreferences/setInterfaceLanguageAsync',
  async (language, {dispatch}) => {
    const userPreferences = await UserPreference.getInstance();
    if (userPreferences) await userPreferences.setLanguage(language);
    dispatch(setInterfaceLanguage(language));
  },
);

export const initializeUserPreferences = createAsyncThunk<void, void, AppAsyncThunkConfig>(
  'userPreferences/init',
  async (_, {dispatch, fulfillWithValue}) => {
    const userPreferences = await UserPreference.getInstance();

    if (!userPreferences) {
      await UserPreference.initialize();
      dispatch(setConfig(CONFIG));
      return fulfillWithValue(undefined);
    }

    dispatch(
      setConfig({
        language: userPreferences.language,
        colorSchemeName: userPreferences.colorSchemeName,
        allowPornography: userPreferences.allowPornography,
        preferDataSaver: userPreferences.preferDataSaver,
        preferBGDownloadsDataSaver: userPreferences.preferBGDownloadsDataSaver,
        readingMode: userPreferences.readingMode,
        maxConcurrentDownloads: userPreferences.maxConcurrentDownloads,
      }),
    );

    return fulfillWithValue(undefined);
  },
);

export const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState: initialState,
  reducers: {
    setColorScheme: (state, action: PayloadAction<ColorSchemeName>) => {
      state.colorSchemeName = action.payload;
    },
    setPornographyVis: (state, action: PayloadAction<boolean>) => {
      state.allowPornography = action.payload;
    },
    setReadingMode: (state, action: PayloadAction<READING_MODES>) => {
      state.readingMode = action.payload;
    },
    setDataSaver: (state, action: PayloadAction<boolean>) => {
      state.preferDataSaver = action.payload;
    },
    setInterfaceLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    setMaxConcurrentDownloads: (state, action: PayloadAction<number>) => {
      state.maxConcurrentDownloads = action.payload;
    },
    setConfig: (state, action: PayloadAction<Config>) => {
      const {colorSchemeName, language, allowPornography, preferDataSaver, readingMode} =
        action.payload;
      state.colorSchemeName = colorSchemeName;
      state.language = language;
      state.allowPornography = allowPornography;
      state.preferDataSaver = preferDataSaver;
      state.readingMode = readingMode;
    },
  },
});

const {
  setConfig,
  setColorScheme,
  setReadingMode,
  setDataSaver,
  setPornographyVis,
  setInterfaceLanguage,
  setMaxConcurrentDownloads,
} = userPreferencesSlice.actions;
export const userPreferences = (state: RootState) => state.userPreferences;
export default userPreferencesSlice.reducer;
