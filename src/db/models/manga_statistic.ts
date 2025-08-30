import {Model, Q} from '@nozbe/watermelondb';
import {field, relation, text, writer} from '@nozbe/watermelondb/decorators';
import Manga from './manga';
import {database} from '@db';
import {res_get_statistics_manga} from '@api';

export default class MangaStatistic extends Model {
  static table = 'manga_statistics';

  static associations = {
    mangas: {type: 'belongs_to', key: 'manga_id'},
  } as const;

  @text('manga_id') mangaId!: string;
  @field('follows') follows!: number;
  @field('rating_average') ratingAverage?: number;
  @field('rating_bayesian') ratingBayesian?: number;
  @field('comments_thread_id') commentsThreadId?: number;
  @field('comments_replies_count') commentsRepliesCount?: number;

  @relation('mangas', 'manga_id') manga!: Manga;

  static async getStatisticForManga(mangaId: string): Promise<MangaStatistic | undefined> {
    const statsCollection = database.collections.get<MangaStatistic>('manga_statistics');
    const stats = (await statsCollection.query(Q.where('manga_id', mangaId)).fetch())[0];

    return stats;
  }

  static async upsertFromApiResult(
    mangaId: string,
    stats: res_get_statistics_manga['statistics'][string],
  ): Promise<MangaStatistic> {
    const existingStat = await this.getStatisticForManga(mangaId);

    if (existingStat) {
      await existingStat.updateStatistics(stats);
      return existingStat;
    }

    let newRecord: MangaStatistic | undefined;
    await database.write(async () => {
      newRecord = await database.get<MangaStatistic>('manga_statistics').create(dbStat => {
        dbStat._raw.id = `stat_${mangaId}`;
        dbStat.mangaId = mangaId;
        dbStat.follows = stats.follows;
        dbStat.ratingAverage = stats.rating.average;
        dbStat.ratingBayesian = stats.rating.bayesian;
        dbStat.commentsThreadId = stats.comments?.threadId;
        dbStat.commentsRepliesCount = stats.comments?.repliesCount;
      });
    });
    return newRecord!;
  }

  @writer async updateStatistics(newStats: res_get_statistics_manga['statistics'][string]) {
    await this.update(stat => {
      stat.follows = newStats.follows;
      stat.ratingAverage = newStats.rating.average;
      stat.ratingBayesian = newStats.rating.bayesian;
      stat.commentsThreadId = newStats.comments?.threadId;
      stat.commentsRepliesCount = newStats.comments?.repliesCount;
    });
  }
}
