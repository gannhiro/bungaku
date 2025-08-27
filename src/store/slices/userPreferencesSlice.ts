import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {PayloadAction} from '@reduxjs/toolkit';
import type {AppAsyncThunkConfig, RootState} from '@store';
import {CONFIG, Config} from '../../../config';
import {ColorSchemeName, Language} from '@constants';
import {READING_MODES} from '@screens';
import {database, UserPreference} from '@db';

const initialState: Config = CONFIG;

export const setColorSchemeAsync = createAsyncThunk<void, ColorSchemeName, AppAsyncThunkConfig>(
  'userPreferences/setColorSchemeAsync',
  async (colorScheme, {dispatch}) => {
    const userPreferences = await UserPreference.getInstance();
    if (userPreferences) {
      await userPreferences.setColorSchemeName(colorScheme);
    }
    dispatch(setColorScheme(colorScheme));
  },
);

export const setPornographyVisAsync = createAsyncThunk<void, boolean, AppAsyncThunkConfig>(
  'userPreferences/setPornographyVisAsync',
  async (allowPornography, {dispatch}) => {
    const userPreferences = await UserPreference.getInstance();
    if (userPreferences) {
      await userPreferences.setAllowPornography(allowPornography);
    }
    dispatch(setPornographyVis(allowPornography));
  },
);

export const setReadingModeAsync = createAsyncThunk<void, READING_MODES, AppAsyncThunkConfig>(
  'userPreferences/setReadingModeAsync',
  async (readingMode, {dispatch}) => {
    const userPreferences = await UserPreference.getInstance();
    if (userPreferences) {
      await userPreferences.setReadingMode(readingMode);
    }
    dispatch(setReadingMode(readingMode));
  },
);

export const setPreferSystemColorAsync = createAsyncThunk<void, boolean, AppAsyncThunkConfig>(
  'userPreferences/setPreferSystemColorAsync',
  async (preferSystemColor, {dispatch}) => {
    const userPreferences = await UserPreference.getInstance();
    if (userPreferences) {
      await userPreferences.setPreferSystemColor(preferSystemColor);
    }
    dispatch(setPreferSystemColor(preferSystemColor));
  },
);

export const setDataSaverAsync = createAsyncThunk<void, boolean, AppAsyncThunkConfig>(
  'userPreferences/setDataSaverAsync',
  async (preferDataSaver, {dispatch}) => {
    const userPreferences = await UserPreference.getInstance();
    if (userPreferences) {
      await userPreferences.setPreferDataSaver(preferDataSaver);
    }
    dispatch(setDataSaver(preferDataSaver));
  },
);

export const setInterfaceLanguageAsync = createAsyncThunk<void, Language, AppAsyncThunkConfig>(
  'userPreferences/setInterfaceLanguageAsync',
  async (language, {dispatch}) => {
    const userPreferences = await UserPreference.getInstance();
    if (userPreferences) {
      await userPreferences.setLanguage(language);
    }
    dispatch(setInterfaceLanguage(language));
  },
);

export const initializeUserPreferences = createAsyncThunk<void, void, AppAsyncThunkConfig>(
  'userPreferences/init',
  async (_, {dispatch, fulfillWithValue}) => {
    const userPreferences = await UserPreference.getInstance();

    if (!userPreferences) {
      console.log('No user preferences found. Creating default settings.');

      try {
        const preferencesCollection = database.get<UserPreference>(UserPreference.table);

        await database.write(async () => {
          return await preferencesCollection.create(preference => {
            preference._raw.id = 'user_preferences_record';
            preference.colorSchemeName = CONFIG.colorScheme;
            preference.language = CONFIG.language;
            preference.allowPornography = CONFIG.allowPornography;
            preference.preferDataSaver = CONFIG.preferDataSaver;
            preference.preferBGDownloadsDataSaver = CONFIG.preferBGDownloadsDataSaver;
            preference.preferSystemColor = CONFIG.preferSystemColor;
            preference.readingMode = CONFIG.readingMode;
          });
        });

        dispatch(setConfig(CONFIG));
        return fulfillWithValue(undefined);
      } catch (error) {
        console.log(error);
        return;
      }
    }

    dispatch(
      setConfig({
        language: userPreferences.language,
        colorScheme: userPreferences.colorSchemeName,
        allowPornography: userPreferences.allowPornography,
        preferDataSaver: userPreferences.preferDataSaver,
        preferBGDownloadsDataSaver: userPreferences.preferBGDownloadsDataSaver,
        preferSystemColor: userPreferences.preferSystemColor,
        readingMode: userPreferences.readingMode,
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

const {
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
