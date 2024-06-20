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
  gen_error,
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

  // manga exists
  // reading manga details and date of addition to library
  console.log('reading from manga-details.json');
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
    console.log('skipping...');
    return;
  }

  // getting chapters in regards to stayUpdatedAfterDate in order to see if there are new chapters
  console.log('fetching chapters...');
  const limit = 500;
  let offset = 0;
  let done = false;
  let tempChapters: res_get_manga_$_feed['data'] = [];

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

    if (chapterData?.result === 'ok') {
      tempChapters = [...tempChapters, ...chapterData.data];

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
  if (tempChapters.length === 0) {
    // no chapters for update
    console.log('no new chapters');
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

  for (const chapter of tempChapters) {
    // skip if chapter already exists or has 0 pages
    if (allChapterIds.includes(chapter.id) || chapter.attributes.pages === 0) {
      continue;
    }

    // download chapter data
    let retries = 0;
    let chapterData: res_at_home_$ | gen_error | null = null;
    let finished = false;
    while (retries < 5 && !finished) {
      chapterData = await mangadexAPI<res_at_home_$, {}>(
        'get',
        '/at-home/server/$',
        {},
        [chapter.id],
      );

      // error downloading chapter data
      if (!chapterData || chapterData.result === 'error') {
        retries++;
      } else {
        finished = true;
      }
    }

    // for lint checker
    if (!chapterData || chapterData.result === 'error') {
      continue;
    }

    const chapterDetails: ChapterDetails = {
      chapter,
      pageFileNames: chapterData.chapter.data,
    };

    await FS.mkdir(
      `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.attributes.translatedLanguage}/${chapter.id}`,
    );

    await FS.writeFile(
      `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.attributes.translatedLanguage}/${chapter.id}/chapter.json`,
      JSON.stringify(chapterDetails),
    );

    let lastIndex = 0;
    retries = 0;
    // download pages
    while (retries < 5 && lastIndex + 1 < chapterData.chapter.data.length) {
      try {
        for (let i = lastIndex; i < chapterData.chapter.data.length; i++) {
          lastIndex = i;
          const {promise} = FS.downloadFile({
            fromUrl: `${chapterData.baseUrl}/data/${chapterData.chapter.hash}/${chapterData.chapter.data[i]}`,
            toFile: `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapter.attributes.translatedLanguage}/${chapter.id}/${chapterData.chapter.data[i]}`,
          });

          const {statusCode} = await promise;
          console.log(`${chapterData.chapter.data[i]}: ${statusCode}`);
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

  let previousChapterCount: UpdatedMangaData[] = JSON.parse(
    (await AsyncStorage.getItem('library-updates')) ?? '[]',
  );
  const mangaIdExists = previousChapterCount.findIndex(
    val => val.mangaId === mangaId,
  );

  if (mangaIdExists > -1) {
    previousChapterCount[mangaIdExists].newChapterCount =
      previousChapterCount[mangaIdExists].newChapterCount + chapterCount;
  } else {
    previousChapterCount = [
      ...previousChapterCount,
      {mangaId, newChapterCount: chapterCount},
    ];
  }

  await AsyncStorage.setItem(
    'library-updates',
    JSON.stringify(previousChapterCount),
  );

  const mangaListNotifId = await notifee.createChannel({
    id: `${mangaId}-updates-notif`,
    name: `${manga.attributes.title.en ?? 'no title'}`,
    vibration: false,
    importance: AndroidImportance.LOW,
  });
  await notifee.displayNotification({
    id: mangaListNotifId,
    title: `${manga.attributes.title.en ?? 'No Title'} has been updated.`,
    body: `${chapterCount} Chapters has been downloaded!`,
    android: {
      channelId: mangaListNotifId,
      badgeIconType: AndroidBadgeIconType.LARGE,
      importance: AndroidImportance.LOW,
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

  // check for mangas in library
  console.log('checking for mangas in library');
  const mangaList: string[] = JSON.parse(
    await FS.readFile(`${FS.DocumentDirectoryPath}/manga/manga-list.json`),
  );

  for (const mangaId of mangaList) {
    console.log(`${mangaId} - started checking for updates`);
    const mangaExists = await FS.exists(
      `${FS.DocumentDirectoryPath}/manga/${mangaId}`,
    );

    if (!mangaExists) {
      // manga does not exist, which would be a very weird case
      console.log(`${mangaId} - this manga directory does not exist! weird!!!`);
      continue;
    }

    getChapters(mangaId);
  }

  BackgroundFetch.finish(taskId);
  return;
}
