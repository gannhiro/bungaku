import {
  res_get_manga,
  res_get_statistics_manga,
  mangadexAPI,
  res_get_cover_$,
  API_COVER_URL,
  get_statistics_manga,
} from '@api';
import {Chip} from '@components';
import {ColorScheme, PRETENDARD_JP} from '@constants';
import {RootStackParamsList} from '@navigation';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootState} from '@store';
import {textColor} from '@utils';
import React, {useEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  Dimensions,
  Vibration,
  Text,
  View,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {FadeIn} from 'react-native-reanimated';
import {useSelector} from 'react-redux';

interface Props {
  manga: res_get_manga['data'][0];
  index: number;
  currentPage: number;
  setCurrCoverSrc: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const {width, height} = Dimensions.get('window');

export function HSJumboListRenderItem({
  manga,
  index,
  currentPage,
  setCurrCoverSrc,
}: Props) {
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );

  const navigation =
    useNavigation<
      StackNavigationProp<RootStackParamsList, 'HomeScreen', undefined>
    >();

  const styles = getStyles(colorScheme);
  const [mangaCoverSrc, setMangaCoverSrc] = useState<string>();
  const [mangaRatings, setMangaRatings] = useState<res_get_statistics_manga>();
  const [loadingCover, setLoadingCover] = useState(true);
  const [coverRetries, setCoverRetries] = useState(0);
  const [coverError, setCoverError] = useState(false);

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => {
      goToChapters();
    });

  function goToChapters() {
    navigation.navigate('MangaChaptersScreen', {
      manga: manga,
    });
    Vibration.vibrate([0, 50], false);
  }

  function coverOnLoadStart() {
    setCoverError(false);
    setLoadingCover(true);
  }

  function coverOnLoadEnd() {
    setLoadingCover(false);
  }

  function coverOnError() {
    if (coverRetries < 1000) {
      setCoverRetries(coverRetries + 1);
    } else if (coverRetries >= 100) {
      setCoverError(true);
      setLoadingCover(false);
    }
  }

  useEffect(() => {
    async function getCover() {
      let mangaCoverId = '';
      manga.relationships.forEach(res => {
        if (res.type === 'cover_art') {
          mangaCoverId = res.id;
        }
      });

      const data = await mangadexAPI<res_get_cover_$, {}>(
        'get',
        '/cover/$',
        {},
        [mangaCoverId],
      );

      if (data.result === 'ok') {
        setMangaCoverSrc(
          `${API_COVER_URL}/${manga.id}/${data.data.attributes.fileName}`,
        );
      }
    }

    async function getRatings() {
      const data = (await mangadexAPI<
        res_get_statistics_manga,
        get_statistics_manga
      >(
        'get',
        '/statistics/manga',
        {manga: [manga.id]},
        [],
      )) as res_get_statistics_manga;

      setMangaRatings(data);
    }

    getCover();
    getRatings();
  }, [manga.id, manga.relationships]);

  useEffect(() => {
    if (index === currentPage) {
      setCurrCoverSrc(mangaCoverSrc);
    }
  }, [currentPage, index, mangaCoverSrc, setCurrCoverSrc]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.innerCont]} entering={FadeIn}>
        <GestureDetector gesture={tapGesture}>
          <Image
            source={{uri: mangaCoverSrc + '.256.jpg'}}
            style={styles.coverImage}
            onLoadEnd={coverOnLoadEnd}
            onError={coverOnError}
            onLoadStart={coverOnLoadStart}
            key={'cover: ' + mangaCoverSrc + ' - ' + coverRetries}
            resizeMode={'cover'}
          />
        </GestureDetector>
        <View style={styles.rightGroup}>
          <Text style={styles.title} numberOfLines={3} ellipsizeMode={'tail'}>
            {manga.attributes.title.en}
          </Text>
          <Text
            style={styles.description}
            numberOfLines={7}
            ellipsizeMode={'tail'}>
            {manga.attributes.description.en}
          </Text>

          <View style={styles.tagsContainer}>
            {manga.attributes.tags.map((tag, i) => {
              if (i < 5) {
                return <Chip label={tag.attributes.name.en} />;
              }
            })}
            {manga.attributes.tags.length > 5 && (
              <Text style={styles.tagName}>
                {manga.attributes.tags.length - 5} more tags...
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      width: width,
      paddingHorizontal: 20,
    },
    innerCont: {
      flexDirection: 'row',
      zIndex: 10,
    },
    coverImage: {
      width: width / 3,
      height: (width / 4) * 2.3,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colorScheme.colors.secondary,
    },
    rightGroup: {
      flex: 1,
      marginLeft: 10,
      height: (width / 4) * 2.3,
    },
    title: {
      fontFamily: 'OtomanopeeOne-Regular',
      fontSize: 20,
      color: textColor(colorScheme.colors.main),
    },
    description: {
      marginTop: 5,
      fontFamily: PRETENDARD_JP.MEDIUM,
      fontSize: 11,
      textAlign: 'justify',
      color: textColor(colorScheme.colors.main),
    },
    tagsContainer: {
      width: '80%',
      alignItems: 'center',
      flexWrap: 'wrap',
      flexDirection: 'row',
    },
    tagName: {
      fontSize: 8,
      fontFamily: PRETENDARD_JP.MEDIUM,
      color: textColor(colorScheme.colors.secondary),
    },
  });
}
