import {Model} from '@nozbe/watermelondb';
import {field, text, writer} from '@nozbe/watermelondb/decorators';
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

  static async getInstance(): Promise<UserPreference | undefined> {
    const preferencesCollection = database.collections.get<UserPreference>(this.table);

    try {
      const preferences = await preferencesCollection.find('user_preferences_record');
      return preferences;
    } catch (error) {
      return undefined;
    }
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

  @writer async setPreferSystemColor(enabled: boolean) {
    await this.update(preference => {
      preference.preferSystemColor = enabled;
    });
  }

  @writer async setAllowPornography(enabled: boolean) {
    await this.update(preference => {
      preference.allowPornography = enabled;
    });
  }

  @writer async updatePreferences(updates: Config) {
    await this.update(preference => {
      preference.allowPornography = updates.allowPornography;
      preference.colorSchemeName = updates.colorScheme;
      preference.language = updates.language;
      preference.preferDataSaver = updates.preferDataSaver;
      preference.preferBGDownloadsDataSaver = updates.preferBGDownloadsDataSaver;
      preference.preferSystemColor = updates.preferSystemColor;
      preference.readingMode = updates.readingMode;
    });
  }
}
