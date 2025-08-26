import {res_get_manga_tag} from '@api';
import Tag from '../db/models/tag'; // Adjust the import path to your Tag model
import {Model} from '@nozbe/watermelondb';

export interface TagDBReady {
  id: string; // This will be used for the record's primary key
  tagId: string;
  group: 'theme' | 'genre' | 'format';
  version: number;
  name: {[key: string]: string};
}

export function transformTags(tags: Tag[]): res_get_manga_tag['data'];
export function transformTags(tags: res_get_manga_tag['data']): TagDBReady[];

export function transformTags(
  tags: Tag[] | res_get_manga_tag['data'],
): res_get_manga_tag['data'] | TagDBReady[] {
  if (tags[0] instanceof Tag) {
    const dbTags = tags as Tag[];
    return dbTags.map(tag => ({
      id: tag.tagId,
      type: 'tag',
      attributes: {
        name: tag.name,
        description: {},
        group: tag.group,
        version: tag.version,
      },
      relationships: [],
    }));
  }

  const apiTags = tags as res_get_manga_tag['data'];
  return apiTags.map(apiTag => ({
    id: apiTag.id,
    tagId: apiTag.id,
    group: apiTag.attributes.group,
    version: apiTag.attributes.version,
    name: apiTag.attributes.name,
  }));
}
