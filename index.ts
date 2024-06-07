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
import {ChapterDetails, MangaDetails} from '@types';

AppRegistry.registerComponent(appName, () => App);
BackgroundFetch.registerHeadlessTask(backgroundLibraryUpdate);

export async function backgroundLibraryUpdate(event: HeadlessEvent) {
  let taskId = event.taskId;

  console.log(
    '[BackgroundFetch HeadlessTask] start: ' +
      taskId +
      ' - ' +
      new Date().toDateString(),
  );

  let updatedMangaCount = 0;

  console.log('checking for mangas in library');
  // check for mangas in library
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
    } else {
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
        continue;
      }

      // getting chapters in regards to stayUpdatedAfterDate in order to see if there are new chapters
      console.log('getting chapters...');
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
          [manga.id],
        );
        console.table(chapterData);

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

      // read all local chapter ids
      const allChapterIds: string[] = [];
      for (const lang of stayUpdatedLanguages) {
        const chaptersDirList = await FS.readDir(
          `${FS.DocumentDirectoryPath}/manga/${manga.id}/${lang}`,
        );

        for (const chapterDir of chaptersDirList) {
          allChapterIds.push(chapterDir.name);
        }
      }

      // check if the array has chapters that can be updated
      if (tempChapters.length > 0) {
        updatedMangaCount++;

        for (const chapter of tempChapters) {
          // skip if chapter already exists or has 0 pages
          if (
            allChapterIds.includes(chapter.id) ||
            chapter.attributes.pages === 0
          ) {
            continue;
          }

          // download chapter data
          const chapterData = await mangadexAPI<res_at_home_$, {}>(
            'get',
            '/at-home/server/$',
            {},
            [chapter.id],
          );

          if (chapterData?.result === 'ok') {
            const chapterDetails: ChapterDetails = {
              chapter,
              pageFileNames: chapterData.chapter.data,
            };

            await FS.mkdir(
              `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.attributes.translatedLanguage}/${chapter.id}`,
            );

            await FS.writeFile(
              `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.attributes.translatedLanguage}/${chapter.id}/chapter.json`,
              JSON.stringify(chapterDetails),
            );

            // download pages
            let retries = 0;
            let lastIndex = 0;
            while (
              retries < 5 &&
              lastIndex + 1 < chapterData.chapter.data.length
            ) {
              try {
                for (
                  let i = lastIndex;
                  i < chapterData.chapter.data.length;
                  i++
                ) {
                  lastIndex = i;
                  const {promise} = FS.downloadFile({
                    fromUrl: `${chapterData.baseUrl}/data/${chapterData.chapter.hash}/${chapterData.chapter.data[i]}`,
                    toFile: `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.attributes.translatedLanguage}/${chapter.id}/${chapterData.chapter.data[i]}`,
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
            if (retries === 5) {
              // downloading pages retried 5 times, meaning the chapter is incomplete.
              // delete chapter folder
              console.error('retried 5 times, deleting chapter');
              await FS.unlink(
                `${FS.DocumentDirectoryPath}/manga/${manga.id}/${chapter.attributes.translatedLanguage}/${chapter.id}`,
              );
            } else {
              console.log('finished downloading chapter');
            }
          }
        }
      } else {
        // no chapters for update
        console.log('no new chapters');
      }
    }

    if (updatedMangaCount > 0) {
      const mangaListNotifId = await notifee.createChannel({
        id: 'mangas-updated-list-notif',
        name: 'Mangas Updated List',
        vibration: false,
        importance: AndroidImportance.MIN,
      });
      await notifee.displayNotification({
        id: mangaListNotifId,
        title: `${updatedMangaCount} Updated mangas in your library!`,
        android: {
          channelId: mangaListNotifId,
          badgeCount: updatedMangaCount,
          badgeIconType: AndroidBadgeIconType.SMALL,
          importance: AndroidImportance.LOW,
        },
      });
    }
  }

  BackgroundFetch.finish(taskId);
  return;
}
