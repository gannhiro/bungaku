import React, {useEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  Dimensions,
  View,
  Text,
  ViewStyle,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import {
  mangadexAPI,
  API_COVER_URL,
  get_statistics_manga,
  res_get_cover_$,
  res_get_manga,
  res_get_statistics_manga,
} from '@api';
import {systemLightGray3, systemMainText, systemRed, white} from '@constants';
import Animated, {
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamsList} from '@navigation';
import {useNavigation} from '@react-navigation/native';

interface Props {
  item: res_get_manga['data'][0];
  index: number;
  size: number;
}

const {width} = Dimensions.get('window');

export default function LSMangaListRenderItem({item, index, size}: Props) {
  const navigation =
    useNavigation<
      StackNavigationProp<RootStackParamsList, 'LibraryScreen', undefined>
    >();
  const [mangaCoverSrc, setMangaCoverSrc] = useState<string>();
  const [mangaRatings, setMangaRatings] = useState<res_get_statistics_manga>();
  const [loadingCover, setLoadingCover] = useState(true);
  const [coverRetries, setCoverRetries] = useState(0);
  const [coverError, setCoverError] = useState(false);

  const pressed = useSharedValue(1);

  const spacingStyle: ViewStyle = {
    marginRight: (index + 1) % 3 === 0 ? 0 : 10,
    marginBottom: index < size - 2 ? 10 : 0,
  };

  const expandStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: pressed.value}],
    };
  });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(goToChapters)();
  });

  function goToChapters() {
    Vibration.vibrate([0, 50], false);
    pressed.value = withSequence(
      withTiming(1.03, {duration: 30}),
      withTiming(1, undefined, isfinished => {
        if (isfinished) {
          runOnJS(redirect)();
        }
      }),
    );
  }

  function redirect() {
    navigation.navigate('MangaChaptersScreen', {
      manga,
      statistics: mangaRatings as res_get_statistics_manga,
      mangaCover: mangaCoverSrc,
    });
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
      item.relationships.forEach(res => {
        if (res.type === 'cover_art') {
          mangaCoverId = res.id;
        }
      });

      const data = (await mangadexAPI<res_get_cover_$, {}>(
        'get',
        '/cover/$',
        {},
        [mangaCoverId],
      )) as res_get_cover_$;

      setMangaCoverSrc(
        `${API_COVER_URL}/${item.id}/${data.data.attributes.fileName}`,
      );
    }

    async function getRatings() {
      const data = (await mangadexAPI<
        res_get_statistics_manga,
        get_statistics_manga
      >(
        'get',
        '/statistics/manga',
        {manga: [item.id]},
        [],
      )) as res_get_statistics_manga;

      setMangaRatings(data);
    }

    getCover();
    getRatings();
  }, [item.id, item.relationships]);

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[styles.container, expandStyle, spacingStyle]}
        entering={FadeIn}>
        <Image
          source={{uri: mangaCoverSrc + '.256.jpg'}}
          style={styles.coverImage}
          onLoadEnd={coverOnLoadEnd}
          onError={coverOnError}
          onLoadStart={coverOnLoadStart}
          key={'cover: ' + mangaCoverSrc + ' - ' + coverRetries}
        />
        <View style={styles.overlay}>
          <View style={styles.overlayDetails}>
            <Text style={styles.overlayDetailsTitle} numberOfLines={2}>
              {item.attributes.title.en !== undefined
                ? item.attributes.title.en
                : 'No Title'}
            </Text>
          </View>
        </View>
        <View style={styles.overlayProgress}>
          {loadingCover && (
            <ActivityIndicator size={'large'} color={systemMainText} />
          )}
          {coverError && <Text style={styles.textError}>error 404</Text>}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    width: (width - 40) / 3,
    height: (width / 4) * 2 - 25,

    borderRadius: 15,
    overflow: 'hidden',

    backgroundColor: systemLightGray3,
    zIndex: 1,
  },
  coverImage: {
    width: (width - 40) / 3,
    height: (width / 4) * 2 - 25,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,

    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlayRatingCont: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlayProgress: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,

    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayDetails: {
    paddingHorizontal: 10,
    paddingBottom: 2,
    paddingTop: 2,
    alignSelf: 'stretch',
    backgroundColor: '#00000099',
  },
  overlayDetUpper: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  overlayIcons: {
    width: 15,
    height: 15,
  },
  overlayDetailsTitle: {
    fontFamily: 'OtomanopeeOne-Regular',
    textAlign: 'center',
    color: white,
    fontSize: 14,
  },
  textError: {
    color: systemRed,
  },
});
