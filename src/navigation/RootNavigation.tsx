import {Overlay} from '@components';
import {AVAILABLE_COLOR_SCHEMES, ColorSchemeName, Dark, Light} from '@constants';
import {AddToLibraryModal, LanguageModal, ThemeModal} from '@modals';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import {
  RootState,
  setColorSchemeAsync,
  setLibraryUpdatesOnLaunch,
  useAppDispatch,
  useAppSelector,
} from '@store';
import {UpdatedMangaNotifications} from '@types';
import {themeConverter} from '@utils';
import React, {useEffect, useState} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {RootStackParamsList} from './types';

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
  const dispatch = useAppDispatch();
  const userPreferences = useAppSelector((state: RootState) => state.userPreferences);
  const {preferSystemColor, colorScheme} = userPreferences;
  const systemColorScheme = useColorScheme();

  const [theme, setTheme] = useState<Theme>(themeConverter(Dark));

  const stackNavOption: StackNavigationOptions = {
    headerShown: false,
    gestureEnabled: false,
  };

  function navOnReady() {
    console.info('Root Navigation READY');
  }

  async function onNavStateChange() {
    const updatesList: UpdatedMangaNotifications[] = JSON.parse(
      (await AsyncStorage.getItem('library-updates')) ?? '[]',
    );
    dispatch(setLibraryUpdatesOnLaunch(updatesList));
  }

  useEffect(() => {
    (async () => {
      if (preferSystemColor) {
        if (systemColorScheme === 'dark') {
          dispatch(setColorSchemeAsync('Dark'));
          setTheme(themeConverter(Dark));
        } else {
          dispatch(setColorSchemeAsync('Light'));
          setTheme(themeConverter(Light));
        }
        return;
      }

      await AsyncStorage.setItem('settings', JSON.stringify(userPreferences));

      Object.keys(AVAILABLE_COLOR_SCHEMES).forEach(scheme => {
        if (scheme === colorScheme) {
          const chosenColorScheme = AVAILABLE_COLOR_SCHEMES[colorScheme];

          changeNavigationBarColor(
            chosenColorScheme.colors.main,
            chosenColorScheme.type === 'light',
            true,
          );
          dispatch(setColorSchemeAsync(scheme));
          setTheme(themeConverter(chosenColorScheme));
        }
      });
    })();
  }, [systemColorScheme, userPreferences, dispatch]);

  return (
    <Overlay>
      <StatusBar
        barStyle={
          AVAILABLE_COLOR_SCHEMES[colorScheme].type === 'dark' ? 'light-content' : 'dark-content'
        }
        translucent={true}
        backgroundColor={'#00000000'}
      />
      <NavigationContainer
        theme={theme}
        onReady={navOnReady}
        onStateChange={onNavStateChange}
        linking={linking}>
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
