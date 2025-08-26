import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';
import Manga from './models/manga';
import Tag from './models/tag';
import UserPreference from './models/userPreferences';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'bungaku',
});

export const database = new Database({
  adapter,
  modelClasses: [Manga, Tag, UserPreference],
});

export {Manga, Tag, UserPreference, schema};

export * from './schema';
