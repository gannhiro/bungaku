import {Model} from '@nozbe/watermelondb';
import {field, text, writer} from '@nozbe/watermelondb/decorators';
import {Language, ColorSchemeName} from '@constants';
import {ReadingMode} from '@screens';
import {database} from '@db';
import {CONFIG, Config} from '../../../config';

export default class UserPreference extends Model {
  static table = 'user_preferences';

  @text('color_scheme_name') colorSchemeName!: ColorSchemeName;
  @text('language') language!: Language;
  @field('allow_pornography') allowPornography!: boolean;
  @field('prefer_data_saver') preferDataSaver!: boolean;
  @field('prefer_bg_downloads_data_saver') preferBGDownloadsDataSaver!: boolean;
  @field('prefer_system_color') preferSystemColor!: boolean;
  @text('reading_mode') readingMode!: ReadingMode;
  @text('active_downloads') maxConcurrentDownloads!: number;

  static async getInstance(): Promise<UserPreference | undefined> {
    const preferencesCollection = database.collections.get<UserPreference>(this.table);

    try {
      const preferences = await preferencesCollection.find('user_preferences_record');
      return preferences;
    } catch (error) {
      return undefined;
    }
  }

  static async initialize() {
    await database.write(async () => {
      await database.collections.get<UserPreference>(this.table).create(preference => {
        preference._raw.id = 'user_preferences_record';
        preference.allowPornography = CONFIG.allowPornography;
        preference.colorSchemeName = CONFIG.colorSchemeName;
        preference.language = CONFIG.language;
        preference.preferDataSaver = CONFIG.preferDataSaver;
        preference.preferBGDownloadsDataSaver = CONFIG.preferBGDownloadsDataSaver;
        preference.readingMode = CONFIG.readingMode;
      });
    });
  }

  static async setColorSchemeName(newColorSchemeName: ColorSchemeName) {
    const instance = await this.getInstance();
    if (instance) await instance.setColorSchemeName(newColorSchemeName);
  }

  static async setLanguage(newLanguage: Language) {
    const instance = await this.getInstance();
    if (instance) await instance.setLanguage(newLanguage);
  }

  static async setReadingMode(newReadingMode: ReadingMode) {
    const instance = await this.getInstance();
    if (instance) await instance.setReadingMode(newReadingMode);
  }

  static async setPreferDataSaver(enabled: boolean) {
    const instance = await this.getInstance();
    if (instance) {
      await instance.setPreferDataSaver(enabled);
    }
  }

  static async setPreferBGDownloadsDataSaver(enabled: boolean) {
    const instance = await this.getInstance();
    if (instance) await instance.setPreferBGDownloadsDataSaver(enabled);
  }

  static async setAllowPornography(enabled: boolean) {
    const instance = await this.getInstance();
    if (instance) await instance.setAllowPornography(enabled);
  }

  static async setMaxConcurrentDownloads(maxConcurrentDownloads: number) {
    const instance = await this.getInstance();
    if (instance) await instance.setMaxConcurrentDownloads(maxConcurrentDownloads);
  }

  static async updatePreferences(updates: Config) {
    const instance = await this.getInstance();
    if (instance) await instance.updatePreferences(updates);
  }

  @writer async setColorSchemeName(newColorSchemeName: ColorSchemeName) {
    await this.update(preference => {
      preference.colorSchemeName = newColorSchemeName;
    });
  }

  @writer async setLanguage(newLanguage: Language) {
    await this.update(preference => {
      preference.language = newLanguage;
    });
  }

  @writer async setReadingMode(newReadingMode: ReadingMode) {
    await this.update(preference => {
      preference.readingMode = newReadingMode;
    });
  }

  @writer async setPreferDataSaver(enabled: boolean) {
    await this.update(preference => {
      preference.preferDataSaver = enabled;
    });
  }

  @writer async setPreferBGDownloadsDataSaver(enabled: boolean) {
    await this.update(preference => {
      preference.preferBGDownloadsDataSaver = enabled;
    });
  }

  @writer async setAllowPornography(enabled: boolean) {
    await this.update(preference => {
      preference.allowPornography = enabled;
    });
  }

  @writer async setMaxConcurrentDownloads(maxConcurrentDownloads: number) {
    await this.update(preference => {
      preference.maxConcurrentDownloads = maxConcurrentDownloads;
    });
  }

  @writer async updatePreferences(updates: Config) {
    await this.update(preference => {
      preference.allowPornography = updates.allowPornography;
      preference.colorSchemeName = updates.colorSchemeName;
      preference.language = updates.language;
      preference.preferDataSaver = updates.preferDataSaver;
      preference.preferBGDownloadsDataSaver = updates.preferBGDownloadsDataSaver;
      preference.readingMode = updates.readingMode;
    });
  }
}
