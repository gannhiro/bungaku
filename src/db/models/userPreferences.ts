import {Model} from '@nozbe/watermelondb';
import {action, field, text} from '@nozbe/watermelondb/decorators';
import {Language, ColorSchemeName} from '@constants';
import {ReadingMode} from '@screens';
import {database} from '@db';
import {Config} from 'config';

export default class UserPreference extends Model {
  static table = 'user_preferences';

  @text('color_scheme_name') colorSchemeName!: ColorSchemeName;
  @text('language') language!: Language;
  @field('allow_pornography') allowPornography!: boolean;
  @field('prefer_data_saver') preferDataSaver!: boolean;
  @field('prefer_bg_downloads_data_saver') preferBGDownloadsDataSaver!: boolean;
  @field('prefer_system_color') preferSystemColor!: boolean;
  @text('reading_mode') readingMode!: ReadingMode;

  static async get(): Promise<UserPreference | undefined> {
    const preferencesCollection = database.collections.get<UserPreference>('user_preferences');

    try {
      const preferences = await preferencesCollection.find('user_preferences');
      return preferences;
    } catch (error) {
      console.log('No user preferences found. Creating default settings.');
      return undefined;
    }
  }

  // @action async setColorSchemeName(newColorSchemeName: ColorSchemeName) {
  //   await this.update(preference => {
  //     preference.colorSchemeName = newColorSchemeName;
  //   });
  // }

  // @action async setLanguage(newLanguage: Language) {
  //   await this.update(preference => {
  //     preference.language = newLanguage;
  //   });
  // }

  // @action async setReadingMode(newReadingMode: ReadingMode) {
  //   await this.update(preference => {
  //     preference.readingMode = newReadingMode;
  //   });
  // }

  // @action async setPreferDataSaver(enabled: boolean) {
  //   await this.update(preference => {
  //     preference.preferDataSaver = enabled;
  //   });
  // }

  // @action async setPreferBGDownloadsDataSaver(enabled: boolean) {
  //   await this.update(preference => {
  //     preference.preferBGDownloadsDataSaver = enabled;
  //   });
  // }

  // @action async setPreferSystemColor(enabled: boolean) {
  //   await this.update(preference => {
  //     preference.preferSystemColor = enabled;
  //   });
  // }

  // @action async setAllowPornography(enabled: boolean) {
  //   await this.update(preference => {
  //     preference.allowPornography = enabled;
  //   });
  // }

  // @action async updatePreferences(updates: Config) {
  //   await this.update(preference => {
  //     Object.assign(preference, updates);
  //   });
  // }
}
