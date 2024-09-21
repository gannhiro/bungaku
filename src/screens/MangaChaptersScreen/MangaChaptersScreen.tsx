import {
  ORDER,
  Ordering,
  get_manga_$_feed,
  get_statistics_manga,
  mangadexAPI,
  res_get_cover_$,
  res_get_manga_$_feed,
  res_get_statistics_manga,
} from '@api';
import {GenericDropdownValues, TabBar} from '@components';
import {ColorScheme, Language} from '@constants';
import {RootStackParamsList} from '@navigation';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {StackScreenProps} from '@react-navigation/stack';
import {RootState, setError} from '@store';
import {useInternetConn} from '@utils';
import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Image, StyleSheet, View} from 'react-native';
import FS from 'react-native-fs';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {FadeIn} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';
import {MCSChaptersTab} from './MCSChaptersTab/MCSChaptersTab';
import {MCSDetailsTab} from './MCSDetailsTab/MCSDetailsTab';
import {
  MangaChaptersScreenContext,
  iMangaChaptersScreenContext,
} from './useMangaChaptersScreenContext';

const {width, height} = Dimensions.get('screen');

type Props = StackScreenProps<RootStackParamsList, 'MangaChaptersScreen'>;

export type MCSBottomTabsParamsList = {
  MCSChaptersTab: undefined;
  MCSDetailsTab: undefined;
};
const BottomTabs = createMaterialTopTabNavigator<MCSBottomTabsParamsList>();

export function MangaChaptersScreen({route, navigation}: Props) {
  const {manga} = route.params;
  const intError = useInternetConn();
  const dispatch = useDispatch();

  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  const languageList: GenericDropdownValues =
    manga.attributes.availableTranslatedLanguages.map(lang => {
      if (lang) {
        return {
          value: lang,
          label: lang.toUpperCase(),
        };
      } else {
        return {
          value: null,
          label: '?',
        };
      }
    });

  const orderItems: GenericDropdownValues = [
    {label: 'Ascending', value: 'asc'},
    {label: 'Descending', value: 'desc'},
  ];

  const coverItem = manga.relationships.find(rs => rs.type === 'cover_art') as
    | res_get_cover_$['data']
    | undefined;
  const coverSrc = `https://uploads.mangadex.org/covers/${manga.id}/${coverItem?.attributes.fileName}`;

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('loading');
  const [statistics, setStatistics] = useState<res_get_statistics_manga | null>(
    null,
  );
  const [sourceChapters, setSourcecChapters] = useState<
    res_get_manga_$_feed['data'] | null
  >(null);
  const [chapters, setChapters] = useState<res_get_manga_$_feed['data']>([]);
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState<Array<Language>>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [order, setOrder] = useState<Ordering>('desc');
  const [showDownloadedChapters, setShowDownloadedChapters] = useState(false);

  const abortController = useRef<AbortController | null>(null);

  async function onAddToLibPress() {
    navigation.navigate('AddToLibraryModal', {manga});
  }

  const value: iMangaChaptersScreenContext = {
    manga,
    statistics,
    chapters,
    onAddToLibPress,
    languages,
    setLanguages,
    languageList,
    loading,
    loadingProgress,
    loadingText,
    setChapters,
    setLoadingProgress,
    setLoadingText,
    setLoading,
    selectMode,
    setSelectMode,
    selectedChapters,
    setSelectedChapters,
    showDownloadedChapters,
    setShowDownloadedChapters,
    order,
    setOrder,
    orderItems,
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoadingProgress(0);

      const tempDownloadedChapters: res_get_manga_$_feed['data'] = [];
      if (showDownloadedChapters || intError) {
        // check for stats locally
        if (intError) {
          const mangaData = JSON.parse(
            await FS.readFile(
              `${FS.DocumentDirectoryPath}/manga/${manga.id}/manga-details.json`,
            ),
          );
          setStatistics(mangaData.statistics as res_get_statistics_manga);
        }

        // check for chapters locally
        const directories = await FS.readDir(
          `${FS.DocumentDirectoryPath}/manga/${manga.id}`,
        );

        for (let i = 0; i < directories.length; i++) {
          if (directories[i].isFile()) {
            continue;
          }
          const langDirectories = await FS.readDir(
            `${FS.DocumentDirectoryPath}/manga/${manga.id}/${directories[i].name}`,
          );

          if (langDirectories.length === 0) {
            continue;
          }

          for (let j = 0; j < langDirectories.length; j++) {
            const chapDetails = JSON.parse(
              await FS.readFile(
                `${FS.DocumentDirectoryPath}/manga/${manga.id}/${directories[i].name}/${langDirectories[j].name}/chapter.json`,
              ),
            );
            tempDownloadedChapters.push(chapDetails.chapter);
          }
        }

        setChapters(tempDownloadedChapters);
        setLoading(false);
        return;
      }

      if (abortController.current) {
        abortController.current.abort();
      }

      let newAbortController = new AbortController();
      abortController.current = newAbortController;

      // get statistics
      console.log('Getting statistics...');
      setLoadingText('fetching statistics...');
      const statisticsData = await mangadexAPI<
        res_get_statistics_manga,
        get_statistics_manga
      >(
        'get',
        '/statistics/manga',
        {manga: [manga.id]},
        [],
        undefined,
        newAbortController.signal,
      );

      if (statisticsData?.result === 'ok') {
        setStatistics(statisticsData);
      }

      // getting chapters
      console.log('Getting chapters...');
      const limit = 500;
      let total: null | number = null;
      let offset = 0;
      let done = false;
      let tempChapters: res_get_manga_$_feed['data'] = [];

      setLoadingText('fetching chapters...');
      while (!done) {
        if (abortController.current) {
          abortController.current.abort();
        }

        newAbortController = new AbortController();
        abortController.current = newAbortController;

        const chapterData = await mangadexAPI<
          res_get_manga_$_feed,
          get_manga_$_feed
        >(
          'get',
          '/manga/$/feed',
          {
            limit: limit,
            offset: offset,
            order: {volume: ORDER.DESCENDING, chapter: ORDER.DESCENDING},
            includes: ['scanlation_group', 'user'],
            contentRating: ['safe', 'suggestive', 'erotica', 'pornographic'],
          },
          [manga.id],
          undefined,
          newAbortController.signal,
        );

        if (chapterData?.result === 'ok') {
          if (!total) {
            total = chapterData.total;
          }
          tempChapters = [...tempChapters, ...chapterData.data];

          if (offset + limit < chapterData.total) {
            offset += limit;
          } else {
            done = true;
          }

          setLoadingProgress(offset / total);
          console.log(offset / total);
        }

        if (chapterData.result === 'internal-error') {
          done = true;
          // TODO: handle this error
        }

        if (chapterData.result === 'aborted') {
          done = true;
          // TODO: handle this error
        }

        if (chapterData?.result === 'error') {
          dispatch(setError(chapterData));
          done = true;
        }
      }
      setLoadingProgress(1);

      setTimeout(() => {
        setSourcecChapters(tempChapters);
        setChapters(tempChapters);
        setLoading(false);
      }, 500);
    })();
  }, [dispatch, languages, manga, showDownloadedChapters]);

  useEffect(() => {
    const navSubscription = navigation.addListener('blur', () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    });

    return () => navSubscription();
  }, [navigation]);

  return (
    <MangaChaptersScreenContext.Provider value={value}>
      <View style={styles.container}>
        <Animated.View style={styles.mangaCoverHeader} entering={FadeIn}>
          <Image source={{uri: coverSrc}} style={styles.cover} />
          <LinearGradient
            style={styles.mangaCoverGradient}
            colors={[`${colorScheme.colors.main}99`, colorScheme.colors.main]}
          />
        </Animated.View>
        <BottomTabs.Navigator
          style={styles.toptabsContainer}
          sceneContainerStyle={styles.sceneCont}
          initialRouteName="MCSChaptersTab"
          tabBar={TabBar}
          tabBarPosition="bottom"
          screenOptions={{swipeEnabled: false}}>
          <BottomTabs.Screen
            name="MCSChaptersTab"
            options={{title: 'Chapters'}}
            component={MCSChaptersTab}
          />
          <BottomTabs.Screen
            name="MCSDetailsTab"
            options={{title: 'Details'}}
            component={MCSDetailsTab}
          />
        </BottomTabs.Navigator>
      </View>
    </MangaChaptersScreenContext.Provider>
  );
}

function getStyles(_colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
    toptabsContainer: {
      width: width,
    },
    mangaCoverHeader: {
      width: width,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    },
    cover: {
      width: width,
      height: height * 0.6,
      opacity: 0.5,
    },
    mangaCoverGradient: {
      height: height * 0.6,
      width: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    sceneCont: {
      backgroundColor: '#0000',
    },
  });
}
