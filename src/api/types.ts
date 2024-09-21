import {Language} from '@constants';

export interface Props<P> {
  method: 'get' | 'post';
  endpoint: endpoints;
  parameters: P;
  additionalParams: string[];
}

export const API_URL = 'https://api.mangadex.org';
export const API_COVER_URL = 'https://uploads.mangadex.org/covers';

export type endpoints =
  | '/manga'
  | '/manga/status'
  | '/manga/tag'
  | '/manga/$/aggregate'
  | '/manga/$/feed'
  | '/cover'
  | '/cover/$'
  | '/statistics/manga'
  | '/group/$'
  | '/group'
  | '/at-home/server/$'
  | '/author/$'
  | '/user'
  | '/user/$'
  | '/user/me'
  | '/user/follows/manga';

export enum PUBLICATION_DEMOGRAPHIC {
  SHOUNEN = 'shounen',
  SHOUJO = 'shoujo',
  JOSEI = 'josei',
  SEINEN = 'seinen',
}
export type PublicationDemographic = `${PUBLICATION_DEMOGRAPHIC}`;

export enum MANGA_STATUS {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  HIATUS = 'hiatus',
  CANCELLED = 'cancelled',
}
export type MangaStatus = `${MANGA_STATUS}`;

export enum READING_STATUS {
  READING = 'reading',
  ON_HOLD = 'on_hold',
  PLAN_TO_READ = 'plan_to_read',
  DROPPED = 'dropped',
  RE_READING = 're_reading',
  COMPLETED = 'completed',
}
export type ReadingStatus = `${READING_STATUS}`;

export enum CONTENT_RATING {
  SAFE = 'safe',
  SUGGESTIVE = 'suggestive',
  EROTICA = 'erotica',
  PORNOGRAPHIC = 'pornographic',
}
export type ContentRating = `${CONTENT_RATING}`;

export enum RELATIONSHIP_TYPES {
  MANGA = 'manga',
  CHAPTER = 'chapter',
  COVER_ART = 'cover_art',
  AUTHOR = 'author',
  ARTIST = 'artist',
  SCANLATION_GROUP = 'scanlation_group',
  TAG = 'tag',
  USER = 'user',
  CUSTOM_LIST = 'custom_list',
}

export enum ORDER {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}

export type Ordering = `${ORDER}`;

export type get_manga = {
  limit: number;
  offset: number;
  title?: string;
  authorOrArtist?: string;
  authors?: string[];
  artists?: string[];
  year?: number;
  includedTags?: string[];
  includedTagsMode?: 'AND' | 'OR';
  excludedTagsMode?: 'AND' | 'OR';
  status?: Array<MangaStatus>;
  originalLanguage?: string[];
  excludedOriginalLanguage?: string[];
  availableTranslatedLanguage?: string[];
  publicationDemographic?: Array<PublicationDemographic>;
  ids?: string[];
  contentRating?: Array<ContentRating>;
  createdAtSince?: string;
  updatedAtSince?: string;
  order?: {
    latestUploadedChapter?: 'desc' | 'asc';
  };
  includes?: Array<'manga' | 'cover_art' | 'author' | 'artist' | 'tag'>;
  hasAvailableChapters?: Array<'true' | 'false' | '0' | '1'>;
  group?: string;
};

export type res_get_manga = {
  result: 'ok';
  response: 'collection';
  data: {
    id: string;
    type: string;
    attributes: {
      title: {
        [key: string]: string;
      };
      altTitles: {[key: string]: string}[];
      description: {
        [key in string]: string;
      };
      isLocked: boolean;
      links: {
        [key: string]: string;
      };
      originalLanguage: Language;
      lastVolume: string;
      lastChapter: string;
      publicationDemographic: PublicationDemographic;
      status: MangaStatus;
      year: number;
      contentRating: ContentRating;
      tags: {
        id: string;
        type: string;
        attributes: {
          name: {
            [key: string]: string;
          };
          description: {};
          group: string;
          version: number;
        };
        relationships: [];
      }[];
      state: string;
      chapterNumbersResetOnNewVolume: boolean;
      createdAt: string;
      updatedAt: string;
      version: number;
      availableTranslatedLanguages: Array<string | null>;
      latestUploadedChapter: string;
    };
    relationships: Array<
      | res_get_cover_$['data']
      | res_get_author_$['data']
      | res_get_group_$['data']
    >;
  }[];
  limit: number;
  offset: number;
  total: number;
};

export type get_cover = {
  limit: number;
  offset: number;
  manga?: string[];
  ids?: string[];
  uploaders?: string[];
  locales?: string[];
  order?: {
    createdAt: 'asc' | 'desc';
    updatedAt: 'asc' | 'desc';
    volume: 'asc' | 'desc';
  };
};

export type res_get_cover = {
  result: 'ok';
  response: string;
  data: {
    id: string;
    type: 'cover_art';
    attributes: {
      volume: string;
      fileName: string;
      description: string;
      locale: string;
      version: number;
      createdAt: string;
      updatedAt: string;
    };
  }[];
  limit: number;
  offset: number;
  total: number;
};

export type res_get_cover_$ = {
  result: 'ok';
  response: string;
  data: {
    id: string;
    type: 'cover_art';
    attributes: {
      volume: string;
      fileName: string;
      description: string;
      locale: string;
      version: number;
      createdAt: string;
      updatedAt: string;
    };
  };
};

export type get_statistics_manga = {
  manga: string[];
};

export type res_get_statistics_manga = {
  result: 'ok';
  statistics: {
    [key: string]: {
      comments: {
        threadId: number;
        repliesCount: number;
      };
      rating: {
        average: number;
        bayesian: number;
      };
      follows: number;
    };
  };
};

export type res_get_manga_tag = {
  result: 'ok';
  response: string;
  data: {
    id: string;
    type: 'tag';
    attributes: {
      name: {
        [key: string]: string;
      };
      description: {};
      group: 'theme' | 'genre' | 'format';
      version: number;
    };
    relationships: [];
  }[];
  limit: number;
  offset: number;
  total: number;
};

export type get_manga_$_feed = {
  limit: number;
  offset: number;
  translatedLanguage?: string[];
  originalLanguage?: string[];
  excludedOriginalLanguage?: string[];
  contentRating?: Array<ContentRating>;
  excludedGroups?: string[];
  includeFutureUpdates?: string[];
  createdAtSince?: string;
  updatedAtSince?: string;
  publishAtSince?: string;
  order?: {
    createdAt?: 'asc' | 'desc';
    updatedAt?: 'asc' | 'desc';
    publishAt?: 'asc' | 'desc';
    readableAt?: 'asc' | 'desc';
    volume?: 'asc' | 'desc';
    chapter?: 'asc' | 'desc';
  };
  includes?: Array<'manga' | 'scanlation_group' | 'user'>;
  includeEmptyPages?: 0 | 1;
  includeFuturePublishAt?: 0 | 1;
  includeExternalUrl?: 0 | 1;
};

export type res_get_manga_$_feed = {
  result: 'ok';
  data: {
    id: string;
    type: string;
    attributes: {
      volume: string | null;
      chapter: string;
      title: string;
      translatedLanguage: Language;
      externalUrl: string;
      publishAt: string;
      readableAt: string;
      createdAt: string;
      updatedAt: string;
      pages: number;
      version: number;
    };
    relationships: Array<res_get_group_$['data'] | res_get_user_$['data']>;
  }[];
  limit: number;
  offset: number;
  total: number;
};

export type get_group = {
  limit: number;
  offset: number;
  ids: string[];
  name?: string;
  focusedLanguage?: string;
  includes?: Array<'leader' | 'member'>;
  order?: {
    latestUploadedChapter: 'asc' | 'desc';
  };
};

export type res_get_group = {
  result: 'ok';
  response: string;
  data: {
    id: string;
    type: string;
    attributes: {
      name: string;
      altNames: string[];
      locked: boolean;
      website: string;
      ircServer: string | null;
      ircChannel: string | null;
      discord: string | null;
      contactEmail: string | null;
      description: string | null;
      twitter: string | null;
      mangaUpdates: null;
      focusedLanguages: ['en'];
      official: boolean;
      verified: boolean;
      inactive: boolean;
      publishDelay: null;
      createdAt: string;
      updatedAt: string;
      version: number;
    };
    relationships: {
      id: string;
      type: 'leader' | 'member';
    }[];
  }[];
};

export type get_group_$ = {
  includes?: Array<'leader' | 'member'>;
};

export type res_get_group_$ = {
  result: 'ok';
  response: string;
  data: {
    id: string;
    type: 'scanlation_group';
    attributes: {
      name: string;
      altNames: string[];
      locked: boolean;
      website: string;
      ircServer: string | null;
      ircChannel: string | null;
      discord: string | null;
      contactEmail: string | null;
      description: string | null;
      twitter: string | null;
      mangaUpdates: null;
      focusedLanguages: ['en'];
      official: boolean;
      verified: boolean;
      inactive: boolean;
      publishDelay: null;
      createdAt: string;
      updatedAt: string;
      version: number;
    };
    relationships: [
      {
        id: string;
        type: 'leader' | 'member';
      },
    ];
  };
};

export type get_manga_$_aggregate = {
  translatedLanguage?: string[];
  groups?: string[];
};

export type res_get_manga_$_aggregate = {
  result: 'ok';
  volumes: {
    [key: string]: {
      volume: string;
      count: number;
      chapters: {
        [key: string]: {
          chapter: string;
          id: string;
          others: string[];
          count: number;
        };
      };
    };
  };
};

export type res_at_home_$ = {
  result: 'ok';
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
};

export type get_author_$ = {
  includes?: Array<'manga' | 'none'>;
};

export type res_get_author_$ = {
  result: 'ok';
  response: string;
  data: {
    id: string;
    type: 'author';
    attributes: {
      name: string;
      imageUrl: string | null;
      biography: {};
      twitter: string | null;
      pixiv: string | null;
      melonBook: string | null;
      fanBox: string | null;
      booth: string | null;
      nicoVideo: string | null;
      skeb: string | null;
      fantia: string | null;
      tumblr: string | null;
      youtube: string | null;
      weibo: string | null;
      naver: string | null;
      website: string | null;
      createdAt: string;
      updatedAt: string;
      version: number;
    };
  };
};

export type get_author = {
  limit: number;
  offset: number;
  ids: string[];
  name: string;
  order?: {
    name: 'asc';
  };
  includes: Array<'manga'>;
};

export type res_get_author = {
  result: 'ok';
  response: string;
  data: {
    id: string;
    type: 'author';
    attributes: {
      name: string;
      imageUrl: string | null;
      biography: {
        key: Language;
      };
      twitter: string | null;
      pixiv: string | null;
      melonBook: string | null;
      fanBox: string | null;
      booth: string | null;
      nicoVideo: string | null;
      skeb: string | null;
      fantia: string | null;
      tumblr: string | null;
      youtube: string | null;
      weibo: string | null;
      naver: string | null;
      website: string | null;
      createdAt: string;
      updatedAt: string;
      version: number;
    };
  }[];
  limit: number;
  offset: number;
  total: number;
};

export type res_get_user_$ = {
  result: 'ok';
  response: 'entity';
  data: {
    id: string;
    type: 'user';
    attributes: {
      username: string;
      roles: string[];
      version: number;
    };
    relationships: any[];
  };
};

export type res_get_user = {
  result: 'ok';
  response: 'entity';
  data: {
    id: string;
    type: 'user';
    attributes: {
      username: string;
      roles: string[];
      version: number;
    };
    relationships: any[];
  }[];
};

export type get_user = {
  limit: number;
  offset: number;
  ids: string[];
  username?: string;
  order?: {
    username: 'asc' | 'desc';
  };
};

export type res_get_user_me = {
  result: 'ok';
  response: string;
  data: {
    id: string;
    type: 'user';
    attributes: {
      username: string;
      roles: string[];
      version: number;
    };
    relationships: [
      {
        id: string;
        type: string;
        related: string;
        attributes: {};
      },
    ];
  };
};

export type get_user_follows_manga = {
  limit: number;
  offset: number;
  includes: Array<
    'manga' | 'cover_art' | 'author' | 'artist' | 'tag' | 'creator'
  >;
};

export type get_manga_status = {
  status: READING_STATUS;
};

export type res_get_manga_status = {
  result: 'ok';
  statuses: {
    [key: string]: READING_STATUS;
  };
};

export type aborted_request = {
  result: 'aborted';
};

export type gen_error = {
  result: 'error';
  errors: [
    {
      id: string;
      status: number;
      title: string;
      detail: string;
      context: string;
    },
  ];
};

export type internal_gen_error = {
  result: 'internal-error';
  title: string;
  desc?: string;
};
