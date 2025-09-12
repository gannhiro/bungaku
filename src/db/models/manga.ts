import {Model, Q, Query} from '@nozbe/watermelondb';
import {field, json, date, text, children, reader, writer} from '@nozbe/watermelondb/decorators';
import {Language} from '@constants';
import {
  ContentRating,
  MangaStatus,
  PublicationDemographic,
  res_get_manga,
  res_get_manga_tag,
} from '@api';
import {Chapter, database, MangaStatistic, UserPreference} from '@db';

export type LibrarySettings = {
  dateAdded: string;
  isDataSaver: boolean;
  stayUpdated: boolean;
  stayUpdatedLanguages: (Language | null)[];
};
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

  static associations = {
    chapters: {type: 'has_many', foreignKey: 'manga_id'},
    manga_statistics: {type: 'has_many', foreignKey: 'manga_id'},
  } as const;

  @text('manga_id') mangaId!: string;
  @text('original_language') originalLanguage!: Language;
  @text('last_volume') lastVolume!: string;
  @text('last_chapter') lastChapter!: string;
  @text('publication_demographic') publicationDemographic!: PublicationDemographic;
  @text('status') status!: MangaStatus;
  @field('year') year!: number;
  @text('content_rating') contentRating!: ContentRating;
  @text('state') state!: string;
  @field('chapter_numbers_reset_on_new_volume') chapterNumbersResetOnNewVolume!: boolean;
  @field('version') version!: number;
  @text('latest_uploaded_chapter') latestUploadedChapter!: string;
  @field('is_locked') isLocked!: boolean;

  @json('title_obj', raw => raw ?? {}) title!: LocalizedString;
  @json('alt_titles_obj', raw => raw ?? []) altTitles!: AltTitle[];
  @json('description_obj', raw => raw ?? {}) description!: LocalizedString;
  @json('links_obj', raw => raw ?? {}) links!: Link;
  @json('tags_obj', raw => raw ?? []) tags!: Tag[];
  @json('available_translated_languages_obj', raw => raw ?? []) availableTranslatedLanguages!: (
    | string
    | null
  )[];
  @json('relationships_obj', raw => raw ?? []) relationships!: Relationship[];

  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @date('date_added') dateAdded?: Date;
  @field('is_data_saver') isDataSaver?: boolean;
  @field('stay_updated') stayUpdated?: boolean;
  @json('stay_updated_languages_obj', raw => raw ?? []) stayUpdatedLanguages!: (Language | null)[];

  @children('chapters') chapters!: Query<Chapter>;
  @children('manga_statistics') statistics!: Query<MangaStatistic>;

  get isInLibrary(): boolean {
    return !!this.stayUpdated;
  }

  static async doesMangaExistById(mangaId: string): Promise<[boolean, boolean]> {
    const manga = await this.getMangaById(mangaId);
    if (!manga) {
      return [false, false];
    }
    return [true, manga.isInLibrary];
  }

  static async getMangaById(mangaId: string): Promise<Manga | undefined> {
    const mangaCollection = database.collections.get<Manga>('mangas');
    const results = await mangaCollection.query(Q.where('manga_id', mangaId)).fetch();

    return results[0];
  }

  static async getAllMangaIds(): Promise<string[]> {
    const mangaCollection = database.collections.get<Manga>('mangas');
    const allMangas = await mangaCollection.query().fetch();

    const libraryMangas = allMangas.filter(manga => manga.stayUpdated !== undefined);

    return libraryMangas.map(manga => manga.mangaId);
  }

  static async getMangaBulk(mangaIds: string[]): Promise<Manga[]> {
    if (mangaIds.length === 0) {
      return [];
    }
    const mangaCollection = database.collections.get<Manga>('mangas');
    const results = await mangaCollection.query(Q.where('manga_id', Q.oneOf(mangaIds))).fetch();
    return results;
  }

  static async upsertFromApi(
    manga: res_get_manga['data'][0],
    librarySettings?: LibrarySettings,
  ): Promise<Manga> {
    const existingManga = await this.getMangaById(manga.id);

    if (existingManga) {
      // Record exists, so update it.
      await existingManga.update(dbManga => {
        (dbManga as Manga)._setFieldsFromApi(manga);
        if (librarySettings) {
          dbManga.dateAdded = librarySettings.dateAdded
            ? new Date(librarySettings.dateAdded)
            : new Date();
          dbManga.isDataSaver = librarySettings.isDataSaver ?? false;
          dbManga.stayUpdated = librarySettings.stayUpdated ?? false;
          dbManga.stayUpdatedLanguages = librarySettings.stayUpdatedLanguages ?? [];
        }
      });
      return existingManga;
    } else {
      // Record does not exist, so create it.
      let newRecord: Manga | undefined;
      await database.write(async () => {
        const mangaCollection = database.collections.get<Manga>('mangas');
        newRecord = await mangaCollection.create(dbManga => {
          const newManga = dbManga as Manga;
          newManga._raw.id = manga.id;
          newManga.mangaId = manga.id;
          newManga._setFieldsFromApi(manga);
          newManga.createdAt = new Date(manga.attributes.createdAt);

          if (librarySettings) {
            newManga.dateAdded = librarySettings.dateAdded
              ? new Date(librarySettings.dateAdded)
              : new Date();
            newManga.isDataSaver = librarySettings.isDataSaver ?? false;
            newManga.stayUpdated = librarySettings.stayUpdated ?? false;
            newManga.stayUpdatedLanguages = librarySettings.stayUpdatedLanguages ?? [];
          }
        });
      });
      return newRecord!;
    }
  }

  static async upsertFromApiBulk(mangas: res_get_manga['data']) {
    const mangaCollection = database.get<Manga>('mangas');
    const existingMangas = await mangaCollection
      .query(Q.where('manga_id', Q.oneOf(mangas.map(m => m.id))))
      .fetch();
    const existingMangaMap = new Map(existingMangas.map(m => [m.mangaId, m]));

    const mangaToCreate = mangas.filter(m => !existingMangaMap.has(m.id));
    const mangaToUpdate = mangas.filter(m => existingMangaMap.has(m.id));

    const batchActions: Model[] = [];

    for (const manga of mangaToUpdate) {
      const record = existingMangaMap.get(manga.id);
      if (record) {
        batchActions.push(
          record.prepareUpdate(dbManga => {
            (dbManga as Manga)._setFieldsFromApi(manga);
          }),
        );
      }
    }

    for (const manga of mangaToCreate) {
      batchActions.push(
        mangaCollection.prepareCreate(dbManga => {
          const newManga = dbManga as Manga;
          newManga._raw.id = manga.id;
          newManga.mangaId = manga.id;
          newManga._setFieldsFromApi(manga);
          newManga.createdAt = new Date(manga.attributes.createdAt);
        }),
      );
    }

    if (batchActions.length > 0) {
      await database.write(async () => {
        await database.batch(batchActions);
      });
    }
  }

  static async deleteMangaById(mangaId: string): Promise<void> {
    const mangaToDelete = await this.getMangaById(mangaId);
    if (!mangaToDelete) {
      console.warn(`Manga with id ${mangaId} not found for deletion.`);
      return;
    }

    const chaptersToDelete = await mangaToDelete.chapters.fetch();
    const statisticToDelete = await MangaStatistic.getStatisticForManga(mangaId);

    const allRecordsToDelete: (Chapter | Manga | MangaStatistic)[] = [
      ...chaptersToDelete,
      mangaToDelete,
    ];
    if (statisticToDelete) {
      allRecordsToDelete.push(statisticToDelete);
    }

    await database.write(async () => {
      const batchDeletions = allRecordsToDelete.map(record => record.prepareDestroyPermanently());
      await database.batch(batchDeletions);
    });
  }

  @reader async getPreferredTitle(): Promise<string> {
    const preferences = await UserPreference.getInstance();

    return (
      this.title?.[preferences?.language ?? ''] ??
      this.altTitles?.find(altTitle => altTitle[preferences?.language ?? ''])?.[
        preferences?.language ?? ''
      ] ??
      Object.values(this?.title ?? {})[0] ??
      this.title?.en ??
      'no title!'
    );
  }

  @writer async updateLibrarySettings(librarySettings: LibrarySettings) {
    await this.update(manga => {
      manga.dateAdded = librarySettings.dateAdded
        ? new Date(librarySettings.dateAdded)
        : manga.dateAdded;
      manga.isDataSaver = librarySettings.isDataSaver ?? manga.isDataSaver;
      manga.stayUpdated = librarySettings.stayUpdated ?? manga.stayUpdated;
      manga.stayUpdatedLanguages =
        librarySettings.stayUpdatedLanguages ?? manga.stayUpdatedLanguages;
    });
  }

  @writer async updateFromApi(manga: res_get_manga['data'][0]) {
    await this.update(dbManga => {
      const {attributes, relationships} = manga;
      dbManga.originalLanguage = attributes.originalLanguage;
      dbManga.lastVolume = attributes.lastVolume;
      dbManga.lastChapter = attributes.lastChapter;
      dbManga.publicationDemographic = attributes.publicationDemographic;
      dbManga.status = attributes.status;
      dbManga.year = attributes.year;
      dbManga.contentRating = attributes.contentRating;
      dbManga.state = attributes.state;
      dbManga.chapterNumbersResetOnNewVolume = attributes.chapterNumbersResetOnNewVolume;
      dbManga.version = attributes.version;
      dbManga.latestUploadedChapter = attributes.latestUploadedChapter;
      dbManga.isLocked = attributes.isLocked;
      dbManga.title = attributes.title;
      dbManga.altTitles = attributes.altTitles;
      dbManga.description = attributes.description;
      dbManga.links = attributes.links;
      dbManga.tags = attributes.tags;
      dbManga.availableTranslatedLanguages = attributes.availableTranslatedLanguages;
      dbManga.relationships = relationships;
      dbManga.updatedAt = new Date(attributes.updatedAt);
    });
  }

  @writer async removeFromLibrary() {
    const allChapters = await this.chapters.fetch();
    const batchActions: Model[] = [];

    for (const chapter of allChapters) {
      if (chapter.isDownloaded) {
        batchActions.push(
          chapter.prepareUpdate(dbChapter => {
            dbChapter._fileNames = [];
            dbChapter._isDataSaver = false;
            dbChapter._isDownloaded = false;
          }),
        );
      }
    }

    batchActions.push(
      this.prepareUpdate(dbManga => {
        dbManga.dateAdded = undefined;
        dbManga.isDataSaver = undefined;
        dbManga.stayUpdated = undefined;
        dbManga.stayUpdatedLanguages = [];
      }),
    );

    await this.database.batch(batchActions);
  }

  @writer async deleteSelfPermanently() {
    await this.destroyPermanently();
  }

  private _setFieldsFromApi(apiManga: res_get_manga['data'][0]) {
    const {attributes, relationships} = apiManga;
    this.originalLanguage = attributes.originalLanguage;
    this.lastVolume = attributes.lastVolume;
    this.lastChapter = attributes.lastChapter;
    this.publicationDemographic = attributes.publicationDemographic;
    this.status = attributes.status;
    this.year = attributes.year;
    this.contentRating = attributes.contentRating;
    this.state = attributes.state;
    this.chapterNumbersResetOnNewVolume = attributes.chapterNumbersResetOnNewVolume;
    this.version = attributes.version;
    this.latestUploadedChapter = attributes.latestUploadedChapter;
    this.isLocked = attributes.isLocked;
    this.title = attributes.title;
    this.altTitles = attributes.altTitles;
    this.description = attributes.description;
    this.links = attributes.links;
    this.tags = attributes.tags;
    this.availableTranslatedLanguages = attributes.availableTranslatedLanguages;
    this.relationships = relationships;
    this.updatedAt = new Date(attributes.updatedAt);
  }
}
