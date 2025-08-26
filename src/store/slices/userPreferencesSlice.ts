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
    await database.write(async () => {
      const userPreferences = await UserPreference.get();
      if (userPreferences) {
        await userPreferences.update(pref => {
          pref.colorSchemeName = colorScheme;
        });
      }
    });
    dispatch(setColorScheme(colorScheme));
  },
);

export const setPornographyVisAsync = createAsyncThunk<void, boolean, AppAsyncThunkConfig>(
  'userPreferences/setPornographyVisAsync',
  async (allowPornography, {dispatch}) => {
    await database.write(async () => {
      const userPreferences = await UserPreference.get();
      if (userPreferences) {
        await userPreferences.update(pref => {
          pref.allowPornography = allowPornography;
        });
      }
    });
    dispatch(setPornographyVis(allowPornography));
  },
);

export const setReadingModeAsync = createAsyncThunk<void, READING_MODES, AppAsyncThunkConfig>(
  'userPreferences/setReadingModeAsync',
  async (readingMode, {dispatch}) => {
    await database.write(async () => {
      const userPreferences = await UserPreference.get();
      if (userPreferences) {
        await userPreferences.update(pref => {
          pref.readingMode = readingMode;
        });
      }
    });
    dispatch(setReadingMode(readingMode));
  },
);

export const setPreferSystemColorAsync = createAsyncThunk<void, boolean, AppAsyncThunkConfig>(
  'userPreferences/setPreferSystemColorAsync',
  async (preferSystemColor, {dispatch}) => {
    await database.write(async () => {
      const userPreferences = await UserPreference.get();
      if (userPreferences) {
        await userPreferences.update(pref => {
          pref.preferSystemColor = preferSystemColor;
        });
      }
    });
    dispatch(setPreferSystemColor(preferSystemColor));
  },
);

export const setDataSaverAsync = createAsyncThunk<void, boolean, AppAsyncThunkConfig>(
  'userPreferences/setDataSaverAsync',
  async (preferDataSaver, {dispatch}) => {
    await database.write(async () => {
      const userPreferences = await UserPreference.get();
      if (userPreferences) {
        await userPreferences.update(pref => {
          pref.preferDataSaver = preferDataSaver;
        });
      }
    });
    dispatch(setDataSaver(preferDataSaver));
  },
);

export const setInterfaceLanguageAsync = createAsyncThunk<void, Language, AppAsyncThunkConfig>(
  'userPreferences/setInterfaceLanguageAsync',
  async (language, {dispatch}) => {
    await database.write(async () => {
      const userPreferences = await UserPreference.get();
      if (userPreferences) {
        await userPreferences.update(pref => {
          pref.language = language;
        });
      }
    });
    dispatch(setInterfaceLanguage(language));
  },
);

export const initializeUserPreferences = createAsyncThunk<
  undefined,
  undefined,
  AppAsyncThunkConfig
>('userPreferences/init', async (_, {dispatch, fulfillWithValue}) => {
  const userPreferences = await UserPreference.get();

  if (!userPreferences) {
    database.write(async () => {
      const preferencesCollection = database.collections.get<UserPreference>('user_preferences');
      await preferencesCollection.create(preference => {
        preference._raw.id = 'user_preferences';
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
});

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
