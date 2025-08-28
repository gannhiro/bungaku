import {mangadexAPI, res_get_manga_tag} from '@api';
import {APP_NAME, ColorScheme, PRETENDARD_JP} from '@constants';
import {database, Tag, UserPreference} from '@db';
import {RootStackParamsList} from '@navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackScreenProps} from '@react-navigation/stack';
import {textColor, useAppCore} from '@utils';
import React, {useEffect, useState} from 'react';
import {PermissionsAndroid, StyleSheet, View} from 'react-native';
import FS from 'react-native-fs';
import * as Progress from 'react-native-progress';
import Animated, {FadeIn} from 'react-native-reanimated';

type Props = StackScreenProps<RootStackParamsList, 'SplashScreen'>;

async function initializeMangaTags() {
  const localTags = await Tag.getAllTags();

  if (localTags.length === 0) {
    const apiTags = await mangadexAPI<res_get_manga_tag, {}>('get', '/manga/tag', {}, []);

    if (apiTags.result !== 'ok') {
      return;
    }

    try {
      const tagsCollection = database.collections.get<Tag>('tags');
      const batchActions = apiTags.data.map(tagData => {
        return tagsCollection.prepareCreate(tag => {
          tag._raw.id = tagData.id;
          tag.tagId = tagData.id;
          tag.group = tagData.attributes.group;
          tag.version = tagData.attributes.version;
          tag.name = tagData.attributes.name;
        });
      });

      await database.write(async () => {
        return await database.batch(...batchActions);
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export function SplashScreen({navigation}: Props) {
  const {dispatch, colorScheme} = useAppCore();
  const styles = getStyles(colorScheme);

  const [loadingText, setLoadingText] = useState('loading');
  const [numDots, setNumDots] = useState(0);
  const [loading, setLoading] = useState(true);

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
    (async () => {
      const firstTimeInstall = await AsyncStorage.getItem('first-time');
      if (!firstTimeInstall) {
        console.log('first time installation.');
        setLoadingText('first time installation');
        await AsyncStorage.setItem('first-time', 'true');

        await FS.mkdir(`${FS.DocumentDirectoryPath}/manga`);

        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS, {
          title: 'bungaku Notifications',
          message: 'Let bungaku send you update notifications for your Library?',
          buttonPositive: 'Yes',
          buttonNegative: 'No',
        });
      }

      setLoadingText('fetching tags');
      await initializeMangaTags();

      setLoadingText('welcome');
      setLoading(false);
    })();
  }, [dispatch]);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        navigation.replace('HomeNavigator');
      }, 2500);
    }
  }, [loading, navigation]);

  return (
    <View style={styles.container}>
      <View>
        <Animated.Text entering={FadeIn.delay(500)} style={styles.appName}>
          {APP_NAME}
        </Animated.Text>
        <View style={styles.progressBarContainer}>
          <Progress.Bar
            indeterminate
            height={1}
            borderWidth={0}
            borderColor={'#0000'}
            style={styles.progressBar}
            color={colorScheme.colors.secondary}
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
    progressBarContainer: {
      flexDirection: 'row',
    },
    progressBar: {
      flex: 1,
    },
  });
}
