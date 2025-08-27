import {res_get_group_$, res_get_manga_$_feed, res_get_user_$} from '@api';
import {Chapter} from '@db';

export interface ChapterDBReady {
  _raw: {id: string};
  chapter_id: string;
  manga_id: string;
  volume?: string;
  chapter_number?: string;
  title?: string;
  translated_language: string;
  external_url?: string;
  publish_at: number;
  readable_at: number;
  created_at: number;
  updated_at: number;
  pages: number;
  version: number;
  relationships_obj: string; // Stored as a JSON string
}

export function transformChapters(chapters: Chapter[]): res_get_manga_$_feed['data'];

export function transformChapters(
  chapters: res_get_manga_$_feed['data'],
  mangaId: string,
): ChapterDBReady[];

export function transformChapters(
  chapters: Chapter[] | res_get_manga_$_feed['data'],
  mangaId?: string,
): res_get_manga_$_feed['data'] | ChapterDBReady[] {
  if (chapters[0] instanceof Chapter) {
    const dbChapters = chapters as Chapter[];
    return dbChapters.map(chapter => ({
      id: chapter.chapterId,
      type: 'chapter',
      attributes: {
        volume: chapter.volume ?? null,
        chapter: chapter.chapterNumber ?? '',
        title: chapter.title ?? '',
        translatedLanguage: chapter.translatedLanguage,
        externalUrl: chapter.externalUrl ?? '',
        publishAt: chapter.publishAt.toISOString(),
        readableAt: chapter.readableAt.toISOString(),
        createdAt: chapter.createdAt.toISOString(),
        updatedAt: chapter.updatedAt.toISOString(),
        pages: chapter.pages,
        version: chapter.version,
      },
      relationships: chapter.relationships as (res_get_group_$['data'] | res_get_user_$['data'])[],
    }));
  }

  const apiChapters = chapters as res_get_manga_$_feed['data'];
  return apiChapters.map(apiChapter => ({
    _raw: {id: apiChapter.id},
    chapter_id: apiChapter.id,
    manga_id: mangaId!,
    volume: apiChapter.attributes.volume || undefined,
    chapter_number: apiChapter.attributes.chapter || undefined,
    title: apiChapter.attributes.title || undefined,
    translated_language: apiChapter.attributes.translatedLanguage,
    external_url: apiChapter.attributes.externalUrl || undefined,
    publish_at: new Date(apiChapter.attributes.publishAt).getTime(),
    readable_at: new Date(apiChapter.attributes.readableAt).getTime(),
    created_at: new Date(apiChapter.attributes.createdAt).getTime(),
    updated_at: new Date(apiChapter.attributes.updatedAt).getTime(),
    pages: apiChapter.attributes.pages,
    version: apiChapter.attributes.version,
    relationships_obj: JSON.stringify(apiChapter.relationships),
  }));
}
