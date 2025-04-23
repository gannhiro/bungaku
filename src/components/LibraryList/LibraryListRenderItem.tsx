import {
  ColorScheme,
  OTOMANOPEE,
  PRETENDARD_JP,
  systemRed,
  white,
} from '@constants';
import {RootStackParamsList} from '@navigation';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  removeLibraryUpdateNotifs,
  RootState,
  useAppDispatch,
  useAppSelector,
} from '@store';
import {MangaDetails} from '@types';
import {textColor} from '@utils';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import FS from 'react-native-fs';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const {width} = Dimensions.get('screen');

type Props = {
  mangaId: string;
  index: number;
};

export function LibraryListRenderItem({mangaId}: Props) {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<
      StackNavigationProp<RootStackParamsList, 'HomeNavigator', undefined>
    >();
  const {colorScheme, language} = useAppSelector(
    (state: RootState) => state.userPreferences,
  );
  const {updatedMangaList} = useAppSelector(
    (state: RootState) => state.libraryUpdates,
  );
  const badgeCount =
    updatedMangaList.find(val => val.mangaId === mangaId)?.newChapterCount ?? 0;
  const styles = getStyles(colorScheme);
  const coverPath = `file://${FS.DocumentDirectoryPath}/manga/${mangaId}/cover.png`;

  const [mangaTitle, setMangaTitle] = useState('');

  const scale = useSharedValue(1);
  const contAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
    };
  });

  const gestures = Gesture.Race(
    Gesture.Tap()
      .onStart(() => {
        scale.value = withSequence(
          withTiming(1.05, {duration: 60}),
          withTiming(1, {duration: 40}),
        );
      })
      .onEnd(() => {
        runOnJS(goToChapters)();
      }),
    Gesture.LongPress().onEnd(() => {}),
  );

  async function goToChapters() {
    Vibration.vibrate([0, 50], false);

    dispatch(removeLibraryUpdateNotifs({mangaId: mangaId}));

    const mangaDetails = await FS.readFile(
      `${FS.DocumentDirectoryPath}/manga/${mangaId}/manga-details.json`,
    );
    const parsedMangaDetails: MangaDetails = JSON.parse(mangaDetails);

    navigation.navigate('MangaChaptersScreen', {
      manga: parsedMangaDetails.manga,
    });
  }

  useEffect(() => {
    (async () => {
      const mangaDetails = await FS.readFile(
        `${FS.DocumentDirectoryPath}/manga/${mangaId}/manga-details.json`,
      );
      const {manga}: MangaDetails = JSON.parse(mangaDetails);

      const title =
        manga.attributes.title[language] ??
        manga.attributes.altTitles.find(keyValue => keyValue[language])?.[
          language
        ] ??
        manga.attributes.title.en;
      setMangaTitle(title);
    })();
  }, [mangaId, language]);

  return (
    <GestureDetector gesture={gestures}>
      <View style={styles.outerCont}>
        <Animated.View style={[styles.container, contAnimStyle]}>
          <Image source={{uri: coverPath}} style={styles.coverImage} />
          <View style={styles.detailsCont}>
            <Text style={styles.titleLabel} numberOfLines={2}>
              {mangaTitle}
            </Text>
          </View>
        </Animated.View>
        {badgeCount > 0 && (
          <View style={styles.badgeOuter}>
            <View style={styles.badgeInner}>
              <Text style={styles.badgeText}>{badgeCount}</Text>
            </View>
          </View>
        )}
      </View>
    </GestureDetector>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    outerCont: {paddingTop: 10, paddingRight: 10},
    container: {
      width: width / 3 - 15,
      borderRadius: 10,
      overflow: 'hidden',
    },
    coverImage: {
      height: width / 3 - 15,
    },
    detailsCont: {
      padding: 3,
      backgroundColor: '#0009',
      width: width / 3 - 15,
      position: 'absolute',
      bottom: 0,
    },
    titleLabel: {
      fontSize: 10,
      fontFamily: OTOMANOPEE,
      textAlign: 'center',
      color: white,
    },
    badgeOuter: {
      position: 'absolute',
      top: 2,
      right: 0,
      paddingHorizontal: 4,
      paddingVertical: 4,
      borderRadius: 100,
      backgroundColor: colorScheme.colors.main,
    },
    badgeInner: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 100,
      backgroundColor: systemRed,
    },
    badgeText: {
      fontSize: 11,
      fontFamily: PRETENDARD_JP.BOLD,
      color: textColor(systemRed),
    },
  });
}
