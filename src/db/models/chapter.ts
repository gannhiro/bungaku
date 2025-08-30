import {date, field, json, reader, relation, text, writer} from '@nozbe/watermelondb/decorators';
import {Language} from '@constants';
import {Model, Q} from '@nozbe/watermelondb';
import Manga from './manga';
import {database} from '@db';
import {res_get_manga_$_feed} from '@api';

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

  @date('publish_at') publishAt!: Date;
  @date('readable_at') readableAt!: Date;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @json('relationships_obj', raw => raw ?? []) relationships!: Relationship[];

  @json('file_names', raw => raw ?? []) _fileNames!: string[];
  @field('is_data_saver') _isDataSaver?: boolean;
  @field('is_downloaded') _isDownloaded?: boolean;

  @relation('mangas', 'manga_id') manga!: Manga;

  get fileNames(): string[] {
    return this._fileNames ?? [];
  }

  get isDataSaver(): boolean {
    return this._isDataSaver ?? false;
  }

  get isDownloaded(): boolean {
    return this._isDownloaded ?? false;
  }

  static async getChapterById(chapterId: string): Promise<Chapter | undefined> {
    try {
      const chapter = await database.get<Chapter>('chapters').find(chapterId);
      return chapter;
    } catch (error) {
      return undefined;
    }
  }

  static async getChaptersForManga(mangaId: string): Promise<Chapter[]> {
    const chaptersCollection = database.collections.get<Chapter>('chapters');
    const chapters = await chaptersCollection.query(Q.where('manga_id', mangaId)).fetch();
    return chapters;
  }

  static async upsertFromApiBulk(mangaId: string, chaptersData: res_get_manga_$_feed['data']) {
    const chapterCollection = database.get<Chapter>('chapters');
    const chapterIds = chaptersData.map(c => c.id);

    const existingChapters = await chapterCollection
      .query(Q.where('chapter_id', Q.oneOf(chapterIds)))
      .fetch();
    const existingChapterMap = new Map(existingChapters.map(c => [c.chapterId, c]));

    const chaptersToCreate = chaptersData.filter(c => !existingChapterMap.has(c.id));
    const chaptersToUpdate = chaptersData.filter(c => existingChapterMap.has(c.id));

    const batchActions: Chapter[] = [];

    for (const chapterApiData of chaptersToUpdate) {
      const record = existingChapterMap.get(chapterApiData.id);
      if (record) {
        batchActions.push(
          record.prepareUpdate(dbChapter => {
            dbChapter._setFieldsFromApi(chapterApiData);
          }),
        );
      }
    }

    for (const chapterApiData of chaptersToCreate) {
      batchActions.push(
        chapterCollection.prepareCreate(dbChapter => {
          const newChapter = dbChapter as Chapter;
          newChapter._raw.id = chapterApiData.id;
          newChapter.chapterId = chapterApiData.id;
          newChapter.mangaId = mangaId;
          newChapter._setFieldsFromApi(chapterApiData);
          newChapter.createdAt = new Date(chapterApiData.attributes.createdAt);
        }),
      );
    }

    if (batchActions.length > 0) {
      await database.write(async () => {
        await database.batch(...batchActions);
      });
    }
  }

  @writer async clearDownloadedData() {
    await this.update(dbChapter => {
      dbChapter._isDataSaver = false;
      dbChapter._isDownloaded = false;
      dbChapter._fileNames = [];
    });
  }

  @writer async updateForDownload(
    isDataSaver: boolean,
    isDownloaded: boolean,
    fileNames?: string[],
  ) {
    await this.update(dbChapter => {
      dbChapter._isDataSaver = isDataSaver;
      dbChapter._isDownloaded = isDownloaded;

      if (fileNames) dbChapter._fileNames = fileNames;
    });
  }

  @writer async updateFileNames(fileNames: string[]) {
    await this.update(dbChapter => {
      dbChapter._fileNames = fileNames;
    });
  }

  @writer async updateIsDataSaver(isDataSaver: boolean) {
    await this.update(dbChapter => {
      dbChapter._isDataSaver = isDataSaver;
    });
  }

  @writer async updateFromApi(apiChapter: res_get_manga_$_feed['data'][0]) {
    await this.update(dbChapter => {
      dbChapter._setFieldsFromApi(apiChapter);
    });
  }

  private _setFieldsFromApi(apiChapter: res_get_manga_$_feed['data'][0]) {
    const {attributes, relationships} = apiChapter;
    this.volume = attributes.volume ?? undefined;
    this.chapterNumber = attributes.chapter ?? undefined;
    this.title = attributes.title ?? undefined;
    this.translatedLanguage = attributes.translatedLanguage;
    this.externalUrl = attributes.externalUrl ?? undefined;
    this.pages = attributes.pages;
    this.version = attributes.version;
    this.publishAt = new Date(attributes.publishAt);
    this.readableAt = new Date(attributes.readableAt);
    this.updatedAt = new Date(attributes.updatedAt);
    this.relationships = relationships as Relationship[];
  }
}
