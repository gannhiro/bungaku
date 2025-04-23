import {res_get_cover_$, res_get_manga} from '@api';
import {
  PRETENDARD_JP,
  systemLightGray3,
  systemPurple,
  systemRed,
  white,
} from '@constants';
import {RootStackParamsList} from '@navigation';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootState, useAppSelector} from '@store';
import {textColor, useInternetConn} from '@utils';
import React, {memo, useEffect, useState} from 'react';
import {Dimensions, StyleSheet, Text, Vibration, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import * as Progress from 'react-native-progress';
import Animated, {
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {FlagIcon} from '..';
import {MangaListRenderItemContRatIcon} from './MangaListRenderItemContRatIcon';
import {MangaListRenderItemStatIcon} from './MangaListRenderItemStatIcon';

interface Props {
  manga: res_get_manga['data'][0];
  index: number;
  size: number;
}

const {width} = Dimensions.get('window');

export const MangaListRenderItem = memo(({manga}: Props) => {
  const intError = useInternetConn();
  const navigation =
    useNavigation<
      StackNavigationProp<RootStackParamsList, 'HomeNavigator', undefined>
    >();
  const {colorScheme} = useAppSelector(
    (state: RootState) => state.userPreferences,
  );
  const {libraryList} = useAppSelector((state: RootState) => state.libraryList);
  const {language} = useAppSelector(
    (state: RootState) => state.userPreferences,
  );
  const [loadingCover, setLoadingCover] = useState(true);
  const [coverRetries, setCoverRetries] = useState(0);
  const [coverError, setCoverError] = useState(false);

  const mangaTitle =
    manga.attributes.title[language] ??
    manga.attributes.altTitles.find(altTitle => altTitle[language])?.[
      language
    ] ??
    manga.attributes.title.en ??
    'NO TITLE!';
  const coverItem = manga.relationships.find(rs => rs.type === 'cover_art') as
    | res_get_cover_$['data']
    | undefined;
  const url = `https://uploads.mangadex.org/covers/${manga.id}/${coverItem?.attributes.fileName}`;
  const inLibrary = libraryList.findIndex(id => id === manga.id);

  const itemScale = useSharedValue(1);
  const contAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: itemScale.value}],
      borderWidth: 1,
      borderColor: withSpring(
        inLibrary !== -1 ? systemPurple : colorScheme.colors.primary,
      ),
    };
  });

  const onPressItem = Gesture.Tap()
    .onStart(() => {
      runOnJS(Vibration.vibrate)([0, 50], false);
      itemScale.value = withSequence(
        withTiming(1.02, {duration: 100}),
        withTiming(1, undefined),
      );
    })
    .onEnd(() => {
      runOnJS(goToChapters)();
    });

  function goToChapters() {
    navigation.navigate('MangaChaptersScreen', {
      manga: manga,
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
    if (!intError) {
      setCoverError(false);
      setCoverRetries(0);
    }
  }, [intError]);

  return (
    <GestureDetector gesture={onPressItem}>
      <Animated.View
        style={[styles.container, contAnimStyle]}
        entering={FadeIn}>
        <FastImage
          source={{uri: `${url}.256.jpg`}}
          style={styles.coverImage}
          onLoadEnd={coverOnLoadEnd}
          onError={coverOnError}
          onLoadStart={coverOnLoadStart}
          key={'cover: ' + url + ' - ' + coverRetries}
        />
        <View style={styles.overlay}>
          <View style={styles.overlayDetails}>
            <View style={styles.overlayDetUpper}>
              <MangaListRenderItemStatIcon status={manga.attributes.status} />
              <MangaListRenderItemContRatIcon
                contentRating={manga.attributes.contentRating}
              />
              <FlagIcon
                language={manga.attributes.originalLanguage}
                style={styles.flagIcon}
              />
            </View>
            <Text style={styles.overlayDetailsTitle} numberOfLines={2}>
              {mangaTitle}
            </Text>
          </View>
        </View>
        <View style={styles.overlayProgress}>
          {loadingCover && (
            <Progress.CircleSnail
              color={textColor(colorScheme.colors.main)}
              size={35}
            />
          )}
          {coverError && <Text style={styles.textError}>error 404</Text>}
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  container: {
    width: (width - 30) / 2,
    height: (width / 3) * 2,

    borderRadius: 15,
    overflow: 'hidden',

    backgroundColor: systemLightGray3,
    zIndex: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  flagIcon: {
    width: 15,
    height: 15,
  },
  coverImage: {
    width: (width - 30) / 2,
    height: (width / 3) * 2,
  },
  overlay: {
    position: 'absolute',
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
    fontFamily: PRETENDARD_JP.REGULAR,
  },
});
