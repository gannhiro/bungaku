import React, {Fragment, useState} from 'react';
import {ListRenderItemInfo, StyleSheet, Vibration} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
  FadeInRight,
  FadeInDown,
} from 'react-native-reanimated';
import {
  res_get_group,
  res_get_user_$,
  res_get_manga_$_feed,
  gen_error,
} from '@api';
import {ColorScheme, PRETENDARD_JP} from '@constants';
import {RootState, useAppSelector} from '@store';
import MCSVIChapterItem from './MCSVIChapterItem';
import {textColor} from '@utils';

type Props = {
  volume: string | 'none' | 'null';
  scanlators?: res_get_group | null;
  users?: (res_get_user_$ | gen_error | null)[];
  chapters: res_get_manga_$_feed['data'];
  allChapters: res_get_manga_$_feed['data'];
  page?: number;
  currentPage?: number;
  mangaId: string;
};

export function MCSVolumeItem({
  volume,
  scanlators,
  users,
  chapters,
  allChapters,
  mangaId,
}: Props) {
  const {colorScheme} = useAppSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);
  const [showChaps, setShowChaps] = useState(false);

  const highestChap = chapters[chapters.length - 1].attributes.chapter;
  const lowestChap = chapters[0].attributes.chapter;

  const volumePressableBG = useSharedValue(colorScheme.colors.secondary);
  const volumePressableStyle = useAnimatedStyle(() => {
    return {
      borderBottomLeftRadius: !showChaps ? 10 : 0,
      borderBottomRightRadius: !showChaps ? 10 : 0,
      backgroundColor: volumePressableBG.value,
    };
  });

  const volumePressableTitle = useSharedValue(
    textColor(colorScheme.colors.secondary),
  );
  const volumePressableTextStyle = useAnimatedStyle(() => {
    return {
      color: volumePressableTitle.value,
    };
  });

  const chevronStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotateZ: withSpring(!showChaps ? 180 + 'deg' : 0 + 'deg')}],
      tintColor: volumePressableTitle.value,
    };
  });

  function renderItem(
    info: ListRenderItemInfo<res_get_manga_$_feed['data'][0]>,
  ) {
    return (
      <MCSVIChapterItem
        key={info.index}
        chapter={info.item}
        allChapters={allChapters}
        scanlators={scanlators}
        users={users}
        mangaId={mangaId}
      />
    );
  }

  const onTapVolume = Gesture.Tap()
    .runOnJS(true)
    .onStart(() => {
      volumePressableBG.value = withSequence(
        withTiming(colorScheme.colors.primary + 99, {duration: 100}),
        withTiming(
          showChaps ? colorScheme.colors.secondary : colorScheme.colors.primary,
          undefined,
          finished => {
            if (finished) {
              runOnJS(setShowChaps)(!showChaps);
            }
          },
        ),
      );
      volumePressableTitle.value = withSequence(
        withTiming(textColor(colorScheme.colors.primary) + 99, {
          duration: 100,
        }),
        withTiming(textColor(colorScheme.colors.secondary)),
      );
      Vibration.vibrate([0, 50], false);
    });

  return (
    <Fragment>
      <GestureDetector gesture={onTapVolume}>
        <Animated.View
          entering={FadeInRight}
          style={[styles.volumeContainer, volumePressableStyle]}>
          <Animated.Text style={[styles.volumeLabel, volumePressableTextStyle]}>
            {!(volume === 'null' || volume === 'none')
              ? 'Volume ' + volume
              : 'No Volume'}
          </Animated.Text>
          <Animated.Text
            style={[styles.volumeChaptersLabel, volumePressableTextStyle]}>
            Ch. {lowestChap + ' - ' + highestChap}
          </Animated.Text>
          <Animated.Image
            source={require('../../../../assets/icons/chevron-down.png')}
            style={[styles.chevron, chevronStyle]}
          />
        </Animated.View>
      </GestureDetector>
      {showChaps && (
        <Animated.FlatList
          maxToRenderPerBatch={3}
          initialNumToRender={10}
          entering={FadeInDown}
          data={chapters}
          renderItem={i => renderItem(i)}
          style={[styles.chaptersDropdownContainer]}
        />
      )}
    </Fragment>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    volumeContainer: {
      padding: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 15,
      marginTop: 5,
    },
    volumeLabel: {
      color: textColor(colorScheme.colors.secondary),
      fontFamily: PRETENDARD_JP.BLACK,
      fontSize: 16,
    },
    volumeChaptersLabel: {
      color: textColor(colorScheme.colors.secondary),
      fontFamily: PRETENDARD_JP.LIGHT,
      fontSize: 12,
    },
    chaptersDropdownContainer: {
      backgroundColor: colorScheme.colors.main,
      borderColor: colorScheme.colors.primary,
      paddingTop: 10,
      borderBottomEndRadius: 15,
      borderBottomStartRadius: 15,
      paddingHorizontal: 10,
      overflow: 'hidden',
      borderWidth: 2,
      borderTopWidth: 0,
    },
    chevron: {
      width: 20,
      height: 20,
      tintColor: textColor(colorScheme.colors.secondary),
    },
  });
}
