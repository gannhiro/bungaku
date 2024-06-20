import React, {useEffect} from 'react';
import {LogBox} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider} from 'react-redux';
import {store} from './src/store/store';
import RootNavigation from './src/navigation/RootNavigation';
import BackgroundFetch from 'react-native-background-fetch';
import {backgroundLibraryUpdate} from './index';

export default function App() {
  LogBox.ignoreAllLogs();

  async function initBackgroundFetch() {
    async function onEvent(taskId: string) {
      console.log('[BackgroundFetch] task: ', taskId);
      await backgroundLibraryUpdate({taskId, timeout: false});
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
      console.log('start background fetch');
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
