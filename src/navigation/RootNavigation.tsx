import {Overlay} from '@components';
import {AVAILABLE_COLOR_SCHEMES, dark, light} from '@constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainer, Theme} from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import {
  CreditsScreen,
  HomeScreen,
  KitchenSinkScreen,
  MangaChaptersScreen,
  ReadChapterScreen,
  SplashScreen,
  TestScreen,
} from '@screens';
import {RootState, setColorScheme, setLibraryUpdates} from '@store';
import {themeConverter} from '@utils';
import React, {useEffect, useState} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {useDispatch, useSelector} from 'react-redux';
import {ThemeModal, AddToLibraryModal, LanguageModal} from '@modals';
import {RootStackParamsList} from './types';
import {UpdatedMangaData} from '@types';

export const Stack = createStackNavigator<RootStackParamsList>();

export default function RootNavigation() {
  const dispatch = useDispatch();
  const {preferSystemColor, colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const preferences = useSelector((state: RootState) => state.userPreferences);
  const systemColorScheme = useColorScheme();

  const [theme, setTheme] = useState<Theme>(themeConverter(dark));

  const stackNavOption: StackNavigationOptions = {
    headerShown: false,
    gestureEnabled: false,
  };

  function navOnReady() {
    console.info('Root Navigation READY');
  }

  async function onNavStateChange() {
    const updatesList: UpdatedMangaData[] = JSON.parse(
      (await AsyncStorage.getItem('library-updates')) ?? '[]',
    );
    dispatch(setLibraryUpdates(updatesList));
  }

  useEffect(() => {
    (async () => {
      if (preferSystemColor) {
        if (systemColorScheme === 'dark') {
          dispatch(setColorScheme(dark));
          setTheme(themeConverter(dark));
        } else {
          dispatch(setColorScheme(light));
          setTheme(themeConverter(light));
        }
        return;
      }

      await AsyncStorage.setItem('settings', JSON.stringify(preferences));

      AVAILABLE_COLOR_SCHEMES.forEach(scheme => {
        if (scheme.name === colorScheme.name) {
          changeNavigationBarColor(
            colorScheme.colors.main,
            colorScheme.type === 'light',
            true,
          );
          dispatch(setColorScheme(scheme));
          setTheme(themeConverter(scheme));
        }
      });
    })();
  }, [
    systemColorScheme,
    preferSystemColor,
    dispatch,
    colorScheme,
    preferences,
  ]);

  return (
    <Overlay>
      <StatusBar
        barStyle={
          colorScheme.type === 'dark' ? 'light-content' : 'dark-content'
        }
        translucent={true}
        backgroundColor={'#00000000'}
      />
      <NavigationContainer
        theme={theme}
        onReady={navOnReady}
        onStateChange={onNavStateChange}>
        <Stack.Navigator
          screenOptions={stackNavOption}
          initialRouteName="SplashScreen">
          <Stack.Screen
            name="KitchenSinkScreen"
            component={KitchenSinkScreen}
          />
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="TestScreen" component={TestScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen
            name="MangaChaptersScreen"
            component={MangaChaptersScreen}
          />
          <Stack.Screen
            name="ReadChapterScreen"
            component={ReadChapterScreen}
          />
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
