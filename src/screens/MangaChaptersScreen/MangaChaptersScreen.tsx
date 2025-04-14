import {
  ORDER,
  Ordering,
  get_manga_$_feed,
  get_statistics_manga,
  mangadexAPI,
  res_get_cover_$,
  res_get_manga_$_feed,
  res_get_statistics_manga,
  res_get_manga,
} from '@api';
import {GenericDropdownValues, TabBar} from '@components';
import {ColorScheme, Language} from '@constants';
import {RootStackParamsList} from '@navigation';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {StackScreenProps} from '@react-navigation/stack';
import {RootState, setError, useAppDispatch, useAppSelector} from '@store';
import {useInternetConn} from '@utils';
import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Image, StyleSheet, View} from 'react-native';
import FS from 'react-native-fs';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {FadeIn} from 'react-native-reanimated';
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
  const dispatch = useAppDispatch();

  const {colorScheme} = useAppSelector(
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

  const coverItem = manga?.relationships.find(rs => rs.type === 'cover_art') as
    | res_get_cover_$['data']
    | undefined;
  const coverSrc = `https://uploads.mangadex.org/covers/${manga?.id}/${coverItem?.attributes.fileName}`;

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('loading');
  const [statistics, setStatistics] =
    useState<res_get_statistics_manga | null>();
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

  const context: iMangaChaptersScreenContext = {
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
    async function fetchDownloadedChapters() {
      const tempDownloadedChapters: res_get_manga_$_feed['data'] = [];
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

      setChapters(tempDownloadedChapters.reverse());
    }

    async function fetchCachedChapters() {
      const tempCachedChapters: res_get_manga_$_feed['data'] = [];
      const chapterDirectories = await FS.readDir(
        `${FS.CachesDirectoryPath}/${manga.id}`,
      );

      for (let i = 0; i < chapterDirectories.length; i++) {
        if (chapterDirectories[i].isFile()) {
          continue;
        }

        const chapDetails = JSON.parse(
          await FS.readFile(
            `${FS.CachesDirectoryPath}/${manga.id}/${chapterDirectories[i].name}/chapter.json`,
          ),
        );
        tempCachedChapters.push(chapDetails.chapter);
      }

      tempCachedChapters.sort((aChap, bChap) => {
        const aChapNumber = parseInt(aChap.attributes.chapter, 10) ?? 0;
        const bChapNumber = parseInt(bChap.attributes.chapter, 10) ?? 0;
        return bChapNumber - aChapNumber;
      });

      const combinedTempChapters = tempCachedChapters.map(cachedChapter => {
        const downloadedChapter = chapters.find(chapter => {
          chapter.id === cachedChapter.id;
        });

        return downloadedChapter ?? cachedChapter;
      });

      setChapters(combinedTempChapters);
    }

    async function fetchChapters() {
      if (abortController.current) {
        abortController.current.abort();
      }

      let newAbortController = new AbortController();
      abortController.current = newAbortController;

      // getting chapters
      console.log('Getting chapters...');
      const limit = 500;
      let total: null | number = null;
      let offset = 0;
      const tempChapters: res_get_manga_$_feed['data'] = [];

      setLoadingText('fetching chapters...');
      while (true) {
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
          tempChapters.push(...chapterData.data);

          if (offset + limit < chapterData.total) {
            offset += limit;
          } else {
            break;
          }

          setLoadingProgress(offset / total);
        }

        if (chapterData.result === 'internal-error') {
          break;
        }

        if (chapterData.result === 'aborted') {
          break;
        }

        if (chapterData?.result === 'error') {
          dispatch(setError(chapterData));
          break;
        }
      }

      if (tempChapters.length > 0) {
        const cachedAndDownloadedChapterIds = chapters.map(
          chapter => chapter.id,
        );
        tempChapters.filter(chapter =>
          cachedAndDownloadedChapterIds.includes(chapter.id),
        );
        setChapters(tempChapters);
      }
    }

    async function fetchStatistics() {
      let newAbortController = new AbortController();
      abortController.current = newAbortController;

      if (abortController.current) {
        abortController.current.abort();
      }

      newAbortController = new AbortController();
      abortController.current = newAbortController;

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
    }

    (async () => {
      setLoading(false);
      setLoadingProgress(0);

      try {
        await fetchDownloadedChapters();
      } catch (e) {
        console.error(`error loading downloaded chapters:\n${e}`);
      }

      try {
        await fetchCachedChapters();
      } catch (e) {
        console.error(`error loading cached chapters:\n${e}`);
      }

      try {
        await fetchChapters();
      } catch (e) {
        console.error(`error loading chapters:\n${e}`);
      }

      try {
        await fetchStatistics();
      } catch (e) {
        console.error(`error loading statistics:\n${e}`);
      }

      setLoadingProgress(1);
      setLoading(false);
    })();
  }, [dispatch, intError, languages, manga, showDownloadedChapters]);

  useEffect(() => {
    const navSubscription = navigation.addListener('blur', () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    });

    return () => navSubscription();
  }, [navigation]);

  return (
    <MangaChaptersScreenContext.Provider value={context}>
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
      height: height * 0.8,
      opacity: 0.5,
    },
    mangaCoverGradient: {
      height: height * 0.8,
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
