import {mangadexAPI, res_get_manga_tag} from '@api';
import {APP_NAME, ColorScheme, PRETENDARD_JP} from '@constants';
import {RootStackParamsList} from '@navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackScreenProps} from '@react-navigation/stack';
import {
  RootState,
  setConfig,
  setError,
  setLibraryList,
  setMangaTags,
} from '@store';
import {textColor} from '@utils';
import {Config} from 'config';
import React, {useEffect, useState} from 'react';
import {PermissionsAndroid, StyleSheet, View} from 'react-native';
import FS from 'react-native-fs';
import * as Progress from 'react-native-progress';
import Animated, {FadeIn} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';

type Props = StackScreenProps<RootStackParamsList, 'SplashScreen'>;

export function SplashScreen({navigation}: Props) {
  const preferences = useSelector((state: RootState) => state.userPreferences);
  const {tags} = useSelector((state: RootState) => state.mangaTags);
  const styles = getStyles(preferences.colorScheme);
  const dispatch = useDispatch();

  const [loadingText, setLoadingText] = useState('loading');
  const [numDots, setNumDots] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // dots effect
  useEffect(() => {
    const dots = setTimeout(() => {
      if (numDots < 3) {
        setNumDots(numDots + 1);
      } else {
        setNumDots(0);
      }
    }, 500);

    if (!loading) {
      return clearTimeout(dots);
    }
  }, [loading, numDots]);

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
    } else {
      return;
    }
    (async () => {
      // check if installed for first time
      const firstTimeInstall = await AsyncStorage.getItem('first-time');
      if (!firstTimeInstall) {
        console.log('first time installation.');
        setLoadingText('first time installation');
        await AsyncStorage.setItem('first-time', 'true');

        // create directories and files
        await FS.mkdir(`${FS.DocumentDirectoryPath}/manga`);

        // get notifcations permission
        const notifPermResult = await PermissionsAndroid.request(
          'android.permission.POST_NOTIFICATIONS',
          {
            title: 'bungaku Notifications',
            message:
              'Let bungaku send you update notifications for your Library?',
            buttonPositive: 'Yes',
            buttonNegative: 'No',
          },
        );
        console.log(notifPermResult);
      } else if (firstTimeInstall === 'true') {
        console.log('not first time installation.');
      }

      // get tags
      const storedTags = await AsyncStorage.getItem('tags');
      if (!storedTags) {
        setLoadingText('fetching tags');
        const data = await mangadexAPI<res_get_manga_tag, {}>(
          'get',
          '/manga/tag',
          {},
          [],
        );
        if (data && data.result === 'ok') {
          dispatch(setMangaTags(data));
          await AsyncStorage.setItem('tags', JSON.stringify(data));
        } else if (data && data.result === 'error') {
          dispatch(setError(data));
        }
      } else {
        setLoadingText('extracting tags');
        const extractedTags: res_get_manga_tag = JSON.parse(storedTags);
        dispatch(setMangaTags(extractedTags));
      }

      // get preferences
      setLoadingText('fetching settings');
      const storedPreferences = await AsyncStorage.getItem('settings');
      if (storedPreferences) {
        const extractedStoredPreference: Config = JSON.parse(storedPreferences);
        dispatch(setConfig(extractedStoredPreference));
        console.log('setting preferences completed.');
      } else {
        await AsyncStorage.setItem('settings', JSON.stringify(preferences));
      }

      // initialize library list
      setLoadingText('getting library');
      const libraryDirList = await FS.readDir(
        `${FS.DocumentDirectoryPath}/manga/`,
      );
      const libraryList = libraryDirList.map(dir => dir.name);
      dispatch(setLibraryList(libraryList));
    })();
    setLoadingText('welcome');
    setLoading(false);
  }, [preferences, dispatch, initialLoad, loading, navigation, tags]);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        navigation.replace('HomeScreen');
      }, 2500);
    }
  }, [loading, navigation]);

  return (
    <View style={styles.container}>
      <View>
        <Animated.Text entering={FadeIn.delay(500)} style={styles.appName}>
          {APP_NAME}
        </Animated.Text>
        <View style={{flexDirection: 'row'}}>
          <Progress.Bar
            indeterminate
            height={1}
            borderWidth={0}
            borderColor={'#0000'}
            style={{flex: 1}}
            color={preferences.colorScheme.colors.secondary}
          />
        </View>

        <Animated.Text entering={FadeIn.delay(500)} style={styles.loadingText}>
          {loadingText}
          {loading &&
            Array(numDots)
              .fill('.')
              .map(dot => dot)}
        </Animated.Text>
      </View>
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colorScheme.colors.main,
    },
    appName: {
      fontSize: 28,
      fontFamily: PRETENDARD_JP.REGULAR,
      color: textColor(colorScheme.colors.main),
    },
    loadingText: {
      fontSize: 10,
      fontFamily: PRETENDARD_JP.LIGHT,
      color: textColor(colorScheme.colors.main),
      textAlign: 'left',
    },
  });
}
