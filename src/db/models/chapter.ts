import {date, field, json, relation, text} from '@nozbe/watermelondb/decorators';
import {Language} from '@constants';
import {Model, Q} from '@nozbe/watermelondb';
import Manga from './manga';
import {database} from '@db';

type Relationship = {
  id: string;
  type: 'scanlation_group' | 'user' | 'manga';
};

export default class Chapter extends Model {
  static table = 'chapters';

  static associations = {
    mangas: {type: 'belongs_to', key: 'manga_id'},
  } as const;

  @text('manga_id') mangaId!: string;
  @text('chapter_id') chapterId!: string;
  @text('volume') volume?: string;
  @text('chapter_number') chapterNumber?: string;
  @text('title') title?: string;
  @text('translated_language') translatedLanguage!: Language;
  @text('external_url') externalUrl?: string;
  @field('pages') pages!: number;
  @field('version') version!: number;

  // Timestamps
  @date('publish_at') publishAt!: Date;
  @date('readable_at') readableAt!: Date;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @json('relationships_obj', raw => raw || []) relationships!: Relationship[];

  @relation('mangas', 'manga_id') manga!: Manga;

  static async getChaptersForManga(mangaId: string): Promise<Chapter[]> {
    const chaptersCollection = database.collections.get<Chapter>('chapters');
    const chapters = await chaptersCollection.query(Q.where('manga_id', mangaId)).fetch();
    return chapters;
  }
}
