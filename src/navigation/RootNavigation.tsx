import {Overlay} from '@components';
import {Dark} from '@constants';
import {AddToLibraryModal, LanguageModal, ThemeModal} from '@modals';
import {
  LinkingOptions,
  NavigationContainer,
  Theme,
  getStateFromPath as defaultGetStateFromPath,
} from '@react-navigation/native';
import {createStackNavigator, StackNavigationOptions} from '@react-navigation/stack';
import {
  CreditsScreen,
  HomeNavigator,
  KitchenSinkScreen,
  MangaChaptersScreen,
  ReadChapterScreen,
  SplashScreen,
  TestScreen,
} from '@screens';
import {themeConverter, useAppCore} from '@utils';
import React, {useEffect, useState} from 'react';
import {StatusBar} from 'react-native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {RootStackParamsList} from './types';
import {UserPreference} from '@db';
import {initializeUserPreferences} from '@store';

export const Stack = createStackNavigator<RootStackParamsList>();

const linking: LinkingOptions<RootStackParamsList> = {
  prefixes: ['bungaku://'],
  config: {
    screens: {
      HomeNavigator: 'home',
      MangaChaptersScreen: {
        path: 'manga/:mangaId',
        parse: {
          mangaId: mangaId => mangaId,
        },
      },
    },
  },
  getStateFromPath(path: string, options: Parameters<typeof defaultGetStateFromPath>[1]) {
    const state = defaultGetStateFromPath(path, options);

    if (state?.routes) {
      const firstRouteName = state.routes[0]?.name;
      if (firstRouteName && firstRouteName !== 'HomeNavigator') {
        return {
          ...state,
          routes: [{name: 'HomeNavigator'}, ...state.routes],
        };
      }
    }

    return state;
  },
};

export default function RootNavigation() {
  const {dispatch} = useAppCore();

  const [ready, setReady] = useState(false);

  const stackNavOption: StackNavigationOptions = {
    headerShown: false,
    gestureEnabled: false,
  };

  function navOnReady() {
    console.info('Root Navigation READY');
  }

  async function onNavStateChange() {
    // TODO: lib updates
  }

  useEffect(() => {
    (async () => {
      await dispatch(initializeUserPreferences());
      setReady(true);
    })();
  }, []);

  if (!ready) return;

  return (
    <Overlay>
      <StatusBar translucent={true} backgroundColor={'#00000000'} />
      <NavigationContainer onReady={navOnReady} onStateChange={onNavStateChange} linking={linking}>
        <Stack.Navigator screenOptions={stackNavOption} initialRouteName="SplashScreen">
          <Stack.Screen name="KitchenSinkScreen" component={KitchenSinkScreen} />
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="TestScreen" component={TestScreen} />
          <Stack.Screen name="HomeNavigator" component={HomeNavigator} />
          <Stack.Screen name="MangaChaptersScreen" component={MangaChaptersScreen} />
          <Stack.Screen name="ReadChapterScreen" component={ReadChapterScreen} />
          <Stack.Screen
            name="ThemeModal"
            component={ThemeModal}
            options={{presentation: 'transparentModal'}}
          />
          <Stack.Screen
            name="LanguageModal"
            component={LanguageModal}
            options={{presentation: 'transparentModal'}}
          />
          <Stack.Screen
            name="AddToLibraryModal"
            component={AddToLibraryModal}
            options={{presentation: 'transparentModal'}}
          />
          <Stack.Screen name="CreditsScreen" component={CreditsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Overlay>
  );
}
