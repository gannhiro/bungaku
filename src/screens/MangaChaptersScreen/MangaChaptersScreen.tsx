import {
  get_manga_$_feed,
  get_statistics_manga,
  mangadexAPI,
  res_get_cover_$,
  res_get_manga_$_feed,
  res_get_statistics_manga,
} from '@api';
import {GenericDropdownValues, GenericTabBar} from '@components';
import {ColorScheme, Language} from '@constants';
import {RootStackParamsList} from '@navigation';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {StackScreenProps} from '@react-navigation/stack';
import {RootState, setError} from '@store';
import {ChapterDetails, MangaDetails} from '@types';
import {useInternetConn} from '@utils';
import React, {useEffect, useState} from 'react';
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

  const [statistics, setStatistics] = useState<res_get_statistics_manga | null>(
    null,
  );
  const [chapters, setChapters] = useState<res_get_manga_$_feed['data']>([]);
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState<Array<Language>>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);

  const coverItem = manga.relationships.find(rs => rs.type === 'cover_art') as
    | res_get_cover_$['data']
    | undefined;
  const coverSrc = `https://uploads.mangadex.org/covers/${manga.id}/${coverItem?.attributes.fileName}`;

  const languageList: GenericDropdownValues[] =
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
    setLoading,
    selectMode,
    setSelectMode,
    selectedChapters,
    setSelectedChapters,
  };

  useEffect(() => {
    (async () => {
      if (!loading) {
        return;
      }

      //check for internet
      const tempDownloadedChapters: res_get_manga_$_feed['data'] = [];
      if (intError) {
        // check for stats locally
        console.log('internet error');
        const mangaData = await FS.readFile(
          `${FS.DocumentDirectoryPath}/manga/${manga.id}/manga-details.json`,
        );
        const parsedMangaData: MangaDetails = JSON.parse(mangaData);
        setStatistics(parsedMangaData.statistics as res_get_statistics_manga);

        // check for chapters locally
        const dir = await FS.readDir(
          `${FS.DocumentDirectoryPath}/manga/${manga.id}`,
        );
        for (let i = 0; i < dir.length; i++) {
          if (
            manga.attributes.availableTranslatedLanguages.includes(dir[i].name)
          ) {
            const langDir = await FS.readDir(
              `${FS.DocumentDirectoryPath}/manga/${manga.id}/${dir[i].name}`,
            );

            for (let j = 0; j < langDir.length; j++) {
              const chapDetails = await FS.readFile(
                `${FS.DocumentDirectoryPath}/manga/${manga.id}/${dir[i].name}/${langDir[j].name}/chapter.json`,
              );
              const parsedChapDetails: ChapterDetails = JSON.parse(chapDetails);
              tempDownloadedChapters.push(parsedChapDetails.chapter);
            }
          }
        }

        setChapters(tempDownloadedChapters);
        if (loading) {
          setLoading(false);
        }
        return;
      }

      // get statistics
      console.log('Getting statistics...');
      const statisticsData = await mangadexAPI<
        res_get_statistics_manga,
        get_statistics_manga
      >('get', '/statistics/manga', {manga: [manga.id]}, []);

      if (statisticsData?.result === 'ok') {
        setStatistics(statisticsData);
      }

      // getting chapters
      console.log('Getting chapters...');
      const limit = 500;
      let offset = 0;
      let done = false;
      let tempChapters: res_get_manga_$_feed['data'] = [];

      while (!done) {
        const chapterData = await mangadexAPI<
          res_get_manga_$_feed,
          get_manga_$_feed
        >(
          'get',
          '/manga/$/feed',
          {
            limit: limit,
            offset: offset,
            order: {volume: 'asc', chapter: 'asc'},
            includes: ['scanlation_group', 'user'],
          },
          [manga.id],
        );

        if (chapterData?.result === 'ok') {
          tempChapters = [...tempChapters, ...chapterData.data];

          if (offset + limit < chapterData.total) {
            offset += limit;
          } else {
            done = true;
          }
        } else {
          dispatch(setError(chapterData));
          done = true;
        }
      }

      setChapters(tempChapters);
      if (loading) {
        setLoading(false);
      }
    })();
  }, [dispatch, languages, loading, manga, intError]);

  useEffect(() => {
    setLoading(true);
  }, [intError]);

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
          tabBar={GenericTabBar}
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
