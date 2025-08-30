import {checkForMangaUpdates} from '@store';
import React, {useEffect} from 'react';
import BackgroundFetch, {HeadlessEvent} from 'react-native-background-fetch';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider} from 'react-redux';
import RootNavigation from './src/navigation/RootNavigation';
import {store} from './src/store/store';
import {Manga} from '@db';

export default function App() {
  useEffect(() => {
    (async () => {
      async function initBackgroundFetch() {
        function onEvent(taskId: string) {
          backgroundWork({
            taskId: taskId,
            timeout: false,
          });
        }

        function onTimeout(taskId: string) {
          console.error('[BackgroundFetch] TIMEOUT task: ', taskId);
          BackgroundFetch.finish(taskId);
        }

        await BackgroundFetch.configure(
          {
            minimumFetchInterval: 60,
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

export async function backgroundWork(event: HeadlessEvent) {
  const mangaIds = await Manga.getAllMangaIds();
  const promises = mangaIds.map(mangaId => store.dispatch(checkForMangaUpdates(mangaId)));

  await Promise.all(promises);

  BackgroundFetch.finish(event.taskId);
}
