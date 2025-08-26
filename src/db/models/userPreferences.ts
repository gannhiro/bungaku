import {Model} from '@nozbe/watermelondb';
import {field, text} from '@nozbe/watermelondb/decorators';
import {Language, ColorSchemeName} from '@constants';
import {ReadingMode} from '@screens';

export default class UserPreference extends Model {
  static table = 'user_preferences';

  @text('color_scheme_name') colorSchemeName!: ColorSchemeName;
  @text('language') language!: Language;
  @field('allow_pornography') allowPornography!: boolean;
  @field('prefer_data_saver') preferDataSaver!: boolean;
  @field('prefer_system_color') preferSystemColor!: boolean;
  @text('reading_mode') readingMode!: ReadingMode;
}
