import {ColorScheme, OTOMANOPEE, white} from '@constants';
import {RootStackParamsList} from '@navigation';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootState} from '@store';
import {MangaDetails} from '@types';
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
import {useSelector} from 'react-redux';

const {width, height} = Dimensions.get('screen');

type Props = {
  mangaId: string;
  coverPath: string;
  index: number;
};

export function LibraryListRenderItem({coverPath, mangaId, index}: Props) {
  const navigation =
    useNavigation<
      StackNavigationProp<RootStackParamsList, 'HomeScreen', undefined>
    >();
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

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

      if (mangaDetails) {
        const parsedMangaDetails: MangaDetails = JSON.parse(mangaDetails);
        const manga = parsedMangaDetails.manga;

        if (manga.attributes.title.en) {
          setMangaTitle(manga.attributes.title.en);
        }
      }
    })();
  }, [mangaId]);

  return (
    <GestureDetector gesture={gestures}>
      <Animated.View style={[styles.container, contAnimStyle]}>
        <Image source={{uri: coverPath}} style={styles.coverImage} />
        <View style={styles.detailsCont}>
          <Text style={styles.titleLabel} numberOfLines={2}>
            {mangaTitle}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

function getStyles(_colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      width: width / 3 - 15,
      marginRight: 10,
      marginBottom: 10,
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
  });
}
