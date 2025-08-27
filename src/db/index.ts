import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';
import Manga from './models/manga';
import Tag from './models/tag';
import Chapter from './models/chapter';
import UserPreference from './models/userPreferences';
import MangaStatistic from './models/manga_statistic';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'bungaku',
});

export const database = new Database({
  adapter,
  modelClasses: [Manga, Tag, Chapter, MangaStatistic, UserPreference],
});

export {Manga, Tag, Chapter, UserPreference, MangaStatistic, schema};

export * from './schema';
