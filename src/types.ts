import {Chapter} from '@db';

export type DownloadedChapterDetails = {
  chapter: Chapter;
  pageFileNames: string[];
  isDataSaver: boolean;
};

export type UpdatedMangaNotifications = {
  [key: string]: {
    newChapterCount: number;
    notificationId: string;
  };
};

export type GitHubUser = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: 'Bot' | 'User';
  site_admin: boolean;
  user_view_type?: string;
};

export type ReleaseAsset = {
  url: string;
  id: number;
  node_id: string;
  name: string;
  label: string | null;
  uploader: GitHubUser;
  content_type: string;
  state: 'uploaded' | string;
  size: number;
  digest: string;
  download_count: number;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  browser_download_url: string;
};

export type GitHubRelease = {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: GitHubUser;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  immutable: boolean;
  prerelease: boolean;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  published_at: string; // ISO 8601 date string
  assets: ReleaseAsset[];
  tarball_url: string | null;
  zipball_url: string | null;
  body: string | null;
};
