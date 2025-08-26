/**
 * @format
 */
import {AppRegistry} from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import 'react-native-gesture-handler';
import App, {backgroundWork} from './App';
import {name as appName} from './app.json';
import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './src/db/schema';
import migrations from './src/db/migration';

import Manga from './src/db/models/manga';
import Tag from './src/db/models/tag';
import UserPreference from './src/db/models/userPreferences';

const adapter = new SQLiteAdapter({
  schema,
  // (You might want to comment it out for development purposes -- see Migrations documentation)
  //   migrations,
  jsi: true /* Platform.OS === 'ios' */,
  // (optional, but you should implement this method)
  onSetUpError: error => {
    console.error(error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Manga, Tag, UserPreference],
});

AppRegistry.registerComponent(appName, () => App);
BackgroundFetch.registerHeadlessTask(backgroundWork);
