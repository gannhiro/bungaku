import {res_get_statistics_manga} from '@api';
import {MangaStatistic} from '@db';

export interface MangaStatisticDBReady {
  _raw: {id: string};
  manga_id: string;
  follows: number;
  rating_average?: number;
  rating_bayesian?: number;
  comments_thread_id?: number;
  comments_replies_count?: number;
}

export function transformMangaStatistics(dbStatistics: MangaStatistic[]): res_get_statistics_manga;
export function transformMangaStatistics(
  apiResponse: res_get_statistics_manga,
): MangaStatisticDBReady[];

export function transformMangaStatistics(
  data: MangaStatistic[] | res_get_statistics_manga,
): res_get_statistics_manga | MangaStatisticDBReady[] {
  if (Array.isArray(data) && data[0] instanceof MangaStatistic) {
    const dbStatistics = data as MangaStatistic[];
    const statisticsObject: res_get_statistics_manga['statistics'] = {};

    for (const stat of dbStatistics) {
      if (!stat.manga.id) continue;

      statisticsObject[stat.manga.id] = {
        follows: stat.follows,
        rating: {
          average: stat.ratingAverage ?? 0,
          bayesian: stat.ratingBayesian ?? 0,
        },
        comments: {
          threadId: stat.commentsThreadId ?? 0,
          repliesCount: stat.commentsRepliesCount ?? 0,
        },
      };
    }
    return {result: 'ok', statistics: statisticsObject};
  }

  const apiResponse = data as res_get_statistics_manga;
  const dbReadyStats: MangaStatisticDBReady[] = [];
  for (const mangaId in apiResponse.statistics) {
    const stats = apiResponse.statistics[mangaId];
    dbReadyStats.push({
      _raw: {id: `stat_${mangaId}`},
      manga_id: mangaId,
      follows: stats.follows,
      rating_average: stats.rating.average,
      rating_bayesian: stats.rating.bayesian,
      comments_thread_id: stats.comments?.threadId,
      comments_replies_count: stats.comments?.repliesCount,
    });
  }
  return dbReadyStats;
}
