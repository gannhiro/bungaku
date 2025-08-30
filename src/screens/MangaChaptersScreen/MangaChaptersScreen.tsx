import {
  get_manga_$,
  get_manga_$_feed,
  get_statistics_manga,
  mangadexAPI,
  Ordering,
  res_get_cover_$,
  res_get_manga_$,
  res_get_manga_$_feed,
  res_get_statistics_manga,
} from '@api';
import {GenericDropdownValues, TabBar} from '@components';
import {ColorScheme, Language} from '@constants';
import {RootStackParamsList} from '@navigation';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {StackScreenProps} from '@react-navigation/stack';
import {setError} from '@store';
import {useAppCore} from '@utils';
import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Image, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {FadeIn} from 'react-native-reanimated';
import {MCSChaptersTab} from './MCSChaptersTab/MCSChaptersTab';
import {MCSDetailsTab} from './MCSDetailsTab/MCSDetailsTab';
import {
  iMangaChaptersScreenContext,
  MangaChaptersScreenContext,
} from './useMangaChaptersScreenContext';
import {Chapter, Manga, MangaStatistic} from '@db';

const {width, height} = Dimensions.get('screen');

type Props = StackScreenProps<RootStackParamsList, 'MangaChaptersScreen'>;

export type MCSBottomTabsParamsList = {
  MCSChaptersTab: undefined;
  MCSDetailsTab: undefined;
};
const BottomTabs = createMaterialTopTabNavigator<MCSBottomTabsParamsList>();

export function MangaChaptersScreen({route, navigation}: Props) {
  const {dispatch, colorScheme} = useAppCore();

  const styles = getStyles(colorScheme);

  const orderItems: GenericDropdownValues = [
    {label: 'Ascending', value: 'asc'},
    {label: 'Descending', value: 'desc'},
  ];

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('loading');
  const [statistics, setStatistics] = useState<MangaStatistic>();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState<Array<Language>>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [order, setOrder] = useState<Ordering>('desc');
  const [showDownloadedChapters, setShowDownloadedChapters] = useState(false);
  const [localManga, setLocalManga] = useState<Manga>();

  const abortController = useRef<AbortController | null>(null);

  const coverItem = localManga?.relationships.find(rs => rs.type === 'cover_art') as
    | res_get_cover_$['data']
    | undefined;
  const coverSrc = coverItem?.attributes?.fileName
    ? `https://uploads.mangadex.org/covers/${localManga?.id}/${
        coverItem?.attributes?.fileName ?? ''
      }`
    : null;
  const languageList: GenericDropdownValues =
    localManga?.availableTranslatedLanguages.map(lang => {
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
    }) ?? [];

  async function onAddToLibPress() {
    if (localManga) {
      navigation.navigate('AddToLibraryModal', {manga: localManga});
    }
  }

  const context: iMangaChaptersScreenContext = {
    manga: localManga,
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
    async function fetchManga() {
      const dbManga = await Manga.getMangaById(route.params.mangaId);

      if (dbManga) {
        setLocalManga(dbManga);
      }

      const data = await mangadexAPI<res_get_manga_$, get_manga_$>(
        'get',
        '/manga/$',
        {includes: ['artist', 'author', 'cover_art', 'tag']},
        [route.params.mangaId],
      );

      if (data.result === 'ok') {
        await dbManga?.updateFromApi(data['data']);
        setLocalManga(dbManga);
      }
    }

    fetchManga();
  }, []);

  useEffect(() => {
    const downloadedChapters: res_get_manga_$_feed['data'] = [];

    async function fetchDownloadedChapters() {
      if (!localManga) return;

      let chaptersFromDb = await Chapter.getChaptersForManga(localManga.id);

      if (chaptersFromDb.length === 0) return;

      setChapters(chaptersFromDb);
    }

    async function fetchChapters() {
      if (!localManga) {
        return;
      }

      if (abortController.current) {
        abortController.current.abort();
      }

      let newAbortController = new AbortController();
      abortController.current = newAbortController;

      const downloadedChapterIds = new Set(downloadedChapters.map(chap => chap.id));
      const limit = 500;
      let total: null | number = null;
      let offset = 0;

      setLoadingText('fetching chapters...');
      while (true) {
        if (abortController.current) {
          abortController.current.abort();
        }

        newAbortController = new AbortController();
        abortController.current = newAbortController;

        const chapterData = await mangadexAPI<res_get_manga_$_feed, get_manga_$_feed>(
          'get',
          '/manga/$/feed',
          {
            limit: limit,
            offset: offset,
            order: {volume: order, chapter: order},
            includes: ['scanlation_group', 'user'],
            contentRating: ['safe', 'suggestive', 'erotica', 'pornographic'],
          },
          [localManga.id],
          undefined,
          newAbortController.signal,
        );

        if (chapterData?.result === 'ok') {
          if (!total) {
            total = chapterData.total;
          }

          await Chapter.upsertFromApiBulk(localManga.mangaId, chapterData.data);

          setChapters(await Chapter.getChaptersForManga(localManga.id));

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
    }

    async function fetchStatistics() {
      if (!localManga) {
        return;
      }

      const statsFromDb = await MangaStatistic.getStatisticForManga(localManga.id);

      if (statsFromDb) {
        setStatistics(statsFromDb);
      }

      let newAbortController = new AbortController();
      abortController.current = newAbortController;

      if (abortController.current) {
        abortController.current.abort();
      }

      newAbortController = new AbortController();
      abortController.current = newAbortController;

      setLoadingText('fetching statistics...');
      const statisticsData = await mangadexAPI<res_get_statistics_manga, get_statistics_manga>(
        'get',
        '/statistics/manga',
        {manga: [localManga.id]},
        [],
        undefined,
        newAbortController.signal,
      );

      if (statisticsData?.result === 'ok') {
        const newStat = await MangaStatistic.upsertFromApiResult(
          localManga.id,
          statisticsData['statistics'][localManga.id],
        );

        setStatistics(newStat);
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
  }, [localManga]);

  useEffect(() => {
    const navSubscription = navigation.addListener('blur', () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    });

    return () => navSubscription();
  }, []);

  return (
    <MangaChaptersScreenContext.Provider value={context}>
      <View style={styles.container}>
        <Animated.View style={styles.mangaCoverHeader} entering={FadeIn}>
          <Image source={{uri: coverSrc ?? ''}} style={styles.cover} key={coverSrc} />
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

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colorScheme.colors.main,
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
