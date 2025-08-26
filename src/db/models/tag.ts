import {Model} from '@nozbe/watermelondb';
import {field, json, text} from '@nozbe/watermelondb/decorators';
import {database} from '../../../index';

type LocalizedString = {[key: string]: string};

export default class Tag extends Model {
  static table = 'tags';

  @text('tag_id') tagId!: string;
  @text('group') group!: 'theme' | 'genre' | 'format';
  @field('version') version!: number;

  @json('name_obj', raw => raw || {}) name!: LocalizedString;

  static async getAllTags(): Promise<Tag[]> {
    const tagsCollection = database.collections.get<Tag>('tags');
    const allTags = await tagsCollection.query().fetch();
    return allTags;
  }
}
