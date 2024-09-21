/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import BackgroundFetch, {HeadlessEvent} from 'react-native-background-fetch';
import notifee, {
  AndroidBadgeIconType,
  AndroidImportance,
} from '@notifee/react-native';
import FS from 'react-native-fs';
import {
  get_manga_$_feed,
  mangadexAPI,
  res_at_home_$,
  res_get_manga_$_feed,
} from '@api';
import {ChapterDetails, MangaDetails, UpdatedMangaData} from '@types';
import AsyncStorage from '@react-native-async-storage/async-storage';

AppRegistry.registerComponent(appName, () => App);
BackgroundFetch.registerHeadlessTask(backgroundLibraryUpdate);

async function getChapters(mangaId: string) {
  let chapterCount = 0;

  // reading manga details and date of addition to library
  const {
    manga,
    stayUpdated,
    stayUpdatedAfterDate,
    stayUpdatedLanguages,
  }: MangaDetails = JSON.parse(
    await FS.readFile(
      `${FS.DocumentDirectoryPath}/manga/${mangaId}/manga-details.json`,
    ),
  );

  // skip if user doesn't want this manga updated
  if (!stayUpdated) {
    return;
  }

  // getting chapters in regards to stayUpdatedAfterDate in order to see if there are new chapters
  const limit = 500;
  let offset = 0;
  let done = false;
  let chapters: res_get_manga_$_feed['data'] = [];

  while (!done) {
    const chapterData = await mangadexAPI<
      res_get_manga_$_feed,
      get_manga_$_feed
    >(
      'get',
      '/manga/$/feed',
      {
        limit: limit,
        offset: offset,
        order: {volume: 'asc', chapter: 'asc'},
        includes: ['scanlation_group', 'user'],
        createdAtSince: stayUpdatedAfterDate,
        translatedLanguage: stayUpdatedLanguages,
        includeEmptyPages: 0,
        includeFuturePublishAt: 0,
      },
      [mangaId],
    );

    if (chapterData.result === 'ok') {
      chapters = [...chapters, ...chapterData.data];

      if (offset + limit < chapterData.total) {
        offset += limit;
      } else {
        done = true;
      }
    } else {
      // TODO: handle error here
      done = true;
    }
  }

  // check if the array has chapters that can be updated
  if (chapters.length === 0) {
    return;
  }

  // read all local chapter ids
  const allChapterIds: string[] = [];
  for (const lang of stayUpdatedLanguages) {
    const chaptersDirList = await FS.readDir(
      `${FS.DocumentDirectoryPath}/manga/${mangaId}/${lang}`,
    );

    for (const chapterDir of chaptersDirList) {
      allChapterIds.push(chapterDir.name);
    }
  }

  for (const chapter of chapters) {
    // skip if chapter already exists, has 0 pages, or has an external url
    if (
      allChapterIds.includes(chapter.id) ||
      chapter.attributes.pages === 0 ||
      chapter.attributes.externalUrl
    ) {
      continue;
    }

    // download chapter data
    let retries = 0;
    let finalChapterData: res_at_home_$ | undefined;
    let finished = false;
    while (retries < 5 && !finished) {
      const tempChapterData = await mangadexAPI<res_at_home_$, {}>(
        'get',
        '/at-home/server/$',
        {},
        [chapter.id],
      );

      if (
        tempChapterData.result === 'error' ||
        tempChapterData.result === 'internal-error' ||
        tempChapterData.result === 'aborted'
      ) {
        retries++;
        continue;
      }
      finalChapterData = tempChapterData;
      finished = true;
    }

    if (!finalChapterData) {
      continue;
    }

    const chapterDetails: ChapterDetails = {
      chapter,
      pageFileNames: finalChapterData.chapter.data,
    };
    await FS.mkdir(
      `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.attributes.translatedLanguage}/${chapter.id}`,
    );
    await FS.writeFile(
      `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.attributes.translatedLanguage}/${chapter.id}/chapter.json`,
      JSON.stringify(chapterDetails),
    );

    // download pages
    let lastIndex = 0;
    retries = 0;
    while (
      retries < 5 &&
      lastIndex + 1 < finalChapterData.chapter.data.length
    ) {
      try {
        for (let i = lastIndex; i < finalChapterData.chapter.data.length; i++) {
          lastIndex = i;
          const {promise} = FS.downloadFile({
            fromUrl: `${finalChapterData.baseUrl}/data/${finalChapterData.chapter.hash}/${finalChapterData.chapter.data[i]}`,
            toFile: `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.attributes.translatedLanguage}/${chapter.id}/${finalChapterData.chapter.data[i]}`,
          });

          const {statusCode} = await promise;
          console.log(`${finalChapterData.chapter.data[i]}: ${statusCode}`);
        }
      } catch (e) {
        // an error has occured fetching one of the pages
        retries++;
        console.error(`retry: ${retries}`);
      }
    }

    if (retries >= 5) {
      // downloading pages retried 5 times, meaning the chapter is incomplete.
      // delete chapter folder
      console.error('retried 5 times, deleting chapter');
      await FS.unlink(
        `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.attributes.translatedLanguage}/${chapter.id}`,
      );
      continue;
    }

    chapterCount++;
    console.log('finished downloading chapter');
  }

  if (chapterCount === 0) {
    return;
  }

  let previousChaptersTracker: UpdatedMangaData[] = JSON.parse(
    (await AsyncStorage.getItem('library-updates')) ?? '[]',
  );
  const mangaIdExists = previousChaptersTracker.findIndex(
    val => val.mangaId === mangaId,
  );

  if (mangaIdExists === -1) {
    previousChaptersTracker = [
      ...previousChaptersTracker,
      {mangaId, newChapterCount: chapterCount},
    ];
  } else {
    previousChaptersTracker[mangaIdExists] = {
      ...previousChaptersTracker[mangaIdExists],
      newChapterCount:
        previousChaptersTracker[mangaIdExists].newChapterCount + chapterCount,
    };
  }

  await AsyncStorage.setItem(
    'library-updates',
    JSON.stringify(previousChaptersTracker),
  );

  const mangaListNotifId = await notifee.createChannel({
    id: `${mangaId}-updates-notif`,
    name: `${manga.attributes.title.en ?? 'no title'}`,
    vibration: false,
    importance: AndroidImportance.DEFAULT,
  });
  await notifee.displayNotification({
    id: mangaListNotifId,
    title: `${manga.attributes.title.en ?? 'No Title'} has been updated.`,
    body: `${chapterCount} Chapters has been downloaded!`,
    android: {
      channelId: mangaListNotifId,
      badgeIconType: AndroidBadgeIconType.SMALL,
    },
  });
}

export async function backgroundLibraryUpdate(event: HeadlessEvent) {
  let taskId = event.taskId;

  console.log(
    '[BackgroundFetch HeadlessTask] start: ' +
      taskId +
      ' - ' +
      new Date().toDateString(),
  );

  const mangaList: string[] = await FS.readdir(
    `${FS.DocumentDirectoryPath}/manga/`,
  );

  for (const mangaId of mangaList) {
    console.log(`${mangaId} - started checking for updates`);
    getChapters(mangaId);
  }

  BackgroundFetch.finish(taskId);
  return;
}
