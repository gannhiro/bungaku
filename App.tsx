import {updateManga} from '@store';
import React, {useEffect} from 'react';
import {LogBox} from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import FS from 'react-native-fs';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider} from 'react-redux';
import RootNavigation from './src/navigation/RootNavigation';
import {store} from './src/store/store';

export default function App() {
  LogBox.ignoreAllLogs();

  async function initBackgroundFetch() {
    async function onEvent(taskId: string) {
      await backgroundWork();
      BackgroundFetch.finish(taskId);
    }

    async function onTimeout(taskId: string) {
      console.error('[BackgroundFetch] TIMEOUT task: ', taskId);
      BackgroundFetch.finish(taskId);
    }

    await BackgroundFetch.configure(
      {
        minimumFetchInterval: 15,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_UNMETERED,
        forceAlarmManager: true,
        requiresBatteryNotLow: true,
        requiresStorageNotLow: true,
        startOnBoot: true,
        enableHeadless: true,
        stopOnTerminate: false,
      },
      onEvent,
      onTimeout,
    );
  }

  useEffect(() => {
    (async () => {
      await initBackgroundFetch();
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <RootNavigation />
      </Provider>
    </GestureHandlerRootView>
  );
}

export async function backgroundWork() {
  let date = new Date();
  console.log(
    `BGFETCH: MANGA UPDATES START - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
  );

  const mangaList: string[] = await FS.readdir(
    `${FS.DocumentDirectoryPath}/manga/`,
  );

  if (mangaList.length === 0) {
    date = new Date();
    console.log(
      `BGFETCH: NO MANGAS TO UPDATE - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
    );

    return;
  }

  const promises = mangaList.map(mangaId => {
    return store.dispatch(updateManga(mangaId));
  });

  const settledMangaUpdates = await Promise.allSettled(promises);
  date = new Date();
  console.log(
    `BGFETCH END: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
  );

  settledMangaUpdates.forEach(mangaUpdate =>
    mangaUpdate.status === 'fulfilled'
      ? console.log(`MANGA ${mangaUpdate.value.meta.arg}: SUCCESS`)
      : console.log('FAILED'),
  );
}
