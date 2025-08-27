import {Model, Q} from '@nozbe/watermelondb';
import {field, json, date, text} from '@nozbe/watermelondb/decorators';
import {Language} from '@constants';
import {ContentRating, MangaStatus, PublicationDemographic} from '@api';
import {database} from '@db';

type LocalizedString = {[key: string]: string};
type AltTitle = {[key: string]: string};
type Link = {[key: string]: string};
type Tag = {
  id: string;
  type: string;
  attributes: {
    name: LocalizedString;
    description: object;
    group: string;
    version: number;
  };
  relationships: [];
};
type Relationship = {
  id: string;
  type: string;
};

export default class Manga extends Model {
  static table = 'mangas';

  @text('manga_id') mangaId!: string;
  @text('original_language') originalLanguage!: Language;
  @text('last_volume') lastVolume?: string;
  @text('last_chapter') lastChapter?: string;
  @text('publication_demographic') publicationDemographic?: PublicationDemographic;
  @text('status') status!: MangaStatus;
  @field('year') year?: number;
  @text('content_rating') contentRating!: ContentRating;
  @text('state') state!: string;
  @field('chapter_numbers_reset_on_new_volume') chapterNumbersResetOnNewVolume!: boolean;
  @field('version') version!: number;
  @text('latest_uploaded_chapter') latestUploadedChapter?: string;
  @field('is_locked') isLocked!: boolean;

  @json('title_obj', raw => raw || {}) title!: LocalizedString;
  @json('alt_titles_obj', raw => raw || []) altTitles!: AltTitle[];
  @json('description_obj', raw => raw || {}) description!: LocalizedString;
  @json('links_obj', raw => raw || {}) links!: Link;
  @json('tags_obj', raw => raw || []) tags!: Tag[];
  @json('available_translated_languages_obj', raw => raw || []) availableTranslatedLanguages!: (
    | string
    | null
  )[];
  @json('relationships_obj', raw => raw || []) relationships!: Relationship[];

  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  static async getMangaById(mangaId: string): Promise<Manga | undefined> {
    const mangaCollection = database.collections.get<Manga>('mangas');
    const results = await mangaCollection.query(Q.where('manga_id', mangaId)).fetch();

    return results[0];
  }
}
