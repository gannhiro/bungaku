import React, {SetStateAction, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  Vibration,
  View,
} from 'react-native';
import {
  Gesture,
  Directions,
  GestureDetector,
} from 'react-native-gesture-handler';
import {StackScreenProps} from '@react-navigation/stack';
import * as Progress from 'react-native-progress';
import {res_at_home_$, mangadexAPI, res_get_manga_$_feed} from '@api';
import {Button, GenericDropdown, GenericDropdownValues} from '@components';
import {white, ColorScheme, PRETENDARD_JP, black} from '@constants';
import {RootStackParamsList} from '@navigation';
import {RootState, setError} from '@store';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  FadeInDown,
  FadeOutDown,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';
import {RCSChapterImages} from './RCSChapterImages';
import {textColor} from '@utils';
import FastImage from 'react-native-fast-image';
import FS from 'react-native-fs';
import {ChapterDetails} from '@types';

type Props = StackScreenProps<RootStackParamsList, 'ReadChapterScreen'>;
export enum READING_MODES {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  WEBTOON = 'webtoon',
}
export type ReadingMode = `${READING_MODES}`;
const readingModes: Array<GenericDropdownValues> = [
  {label: 'Horizontal', value: READING_MODES.HORIZONTAL},
  {label: 'Vertical', value: READING_MODES.VERTICAL},
  {label: 'Webtoon', value: READING_MODES.WEBTOON},
];

const {width, height} = Dimensions.get('screen');

export function ReadChapterScreen({route, navigation}: Props) {
  const dispatch = useDispatch();
  const {mangaId, chapters, initialChapterIndex, user, oReadingMode} =
    route.params;
  const {colorScheme, preferDataSaver, readingMode} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const jobs = useSelector((state: RootState) => state.jobs);
  const styles = getStyles(colorScheme);

  const [locReadingMode, setLocReadingMode] =
    useState<ReadingMode>(readingMode);
  const [currentPage, setCurrentPage] = useState(0);
  const [chapterPages, setChapterPages] = useState<res_at_home_$>();
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(initialChapterIndex);
  const [showBottomOverlay, setShowBottomOverlay] = useState(false);
  const [isDataSaver, setIsDataSaver] = useState(preferDataSaver);
  const [loading, setLoading] = useState(true);
  const [local, setLocal] = useState(false);
  const [localFiles, setLocalFiles] = useState<string[]>([]);

  const listRef =
    useRef<Animated.FlatList<res_get_manga_$_feed['data'][0]>>(null);

  const swipeUp = Gesture.Fling()
    .runOnJS(true)
    .direction(Directions.UP)
    .onEnd(() => {
      console.log('swiped up!');
      setShowSettingsSheet(!showSettingsSheet);
    });

  const swipeLeft = Gesture.Fling()
    .runOnJS(true)
    .direction(Directions.LEFT)
    .onEnd(() => {
      console.log('swiped to the left!');
      setShowSettingsSheet(!showSettingsSheet);
    });

  const listTap = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => {
      console.log('tap');
      const endReached =
        currentPage + 1 === chapterPages?.chapter.dataSaver.length;
      setShowBottomOverlay(!showBottomOverlay);
      if (showSettingsSheet) {
        setShowSettingsSheet(false);
        return;
      }
      if (locReadingMode === 'webtoon') {
        return;
      }
      if (!endReached) {
        setShowBottomOverlay(!showBottomOverlay);
      }
    });

  const nextBtnTap = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => {
      console.log('tapped next btn');
      Vibration.vibrate([0, 50], false);
      setCurrentChapter(currentChapter + 1);
    });

  const prevBtnTap = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => {
      console.log('tapped previous btn');
      Vibration.vibrate([0, 50], false);
      setCurrentChapter(currentChapter - 1);
    });

  const gestures =
    locReadingMode === 'horizontal'
      ? Gesture.Race(swipeUp, listTap)
      : Gesture.Race(swipeLeft, listTap);

  const chapterOverlayOpacity = useSharedValue(1);
  const chapterOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: chapterOverlayOpacity.value,
    };
  });

  const settingsSheetStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(height * 0.3),
      width: withTiming(width),
      borderTopRightRadius: 30,
      borderTopLeftRadius: 30,
    };
  });

  function renderItem({item}: ListRenderItemInfo<string>) {
    const url = local
      ? `file://${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapters[currentChapter].attributes.translatedLanguage}/${chapters[currentChapter].id}/${item}`
      : isDataSaver
      ? `${chapterPages?.baseUrl}/data-saver/${chapterPages?.chapter.hash}/${item}`
      : `${chapterPages?.baseUrl}/data/${chapterPages?.chapter.hash}/${item}`;

    return (
      <RCSChapterImages key={item} url={url} readingMode={locReadingMode} />
    );
  }

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetY = e.nativeEvent.contentOffset.y;
    const offsetX = e.nativeEvent.contentOffset.x;
    const endReached =
      currentPage + 1 === chapterPages?.chapter.dataSaver.length;

    if (locReadingMode === 'horizontal') {
      const tempPage = Math.round(offsetX / width);
      setCurrentPage(tempPage);
    }

    if (locReadingMode === 'vertical') {
      const tempPage = Math.round(offsetY / height);
      setCurrentPage(tempPage);
    }

    if (endReached || currentPage === 0) {
      return;
    }

    if (showBottomOverlay) {
      setShowBottomOverlay(false);
    }
  }

  function onDataSaverSwitchChange(value: boolean) {
    setIsDataSaver(value);
  }

  useEffect(() => {
    listRef.current?.scrollToOffset({animated: false, offset: 0});
    setLoading(true);
    setCurrentPage(0);
    (async () => {
      await FastImage.clearMemoryCache();
      await FastImage.clearDiskCache();

      // check if chapter exists locally and is not a current job
      const isCurrentJob = jobs.some(
        job => job === chapters[currentChapter].id,
      );
      const chaptersDetailsExists = await FS.exists(
        `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapters[currentChapter].attributes.translatedLanguage}/${chapters[currentChapter].id}/chapter.json`,
      );

      if (isCurrentJob || !chaptersDetailsExists) {
        setLocal(false);
      } else if (!isCurrentJob && chaptersDetailsExists) {
        setLocal(true);
        const chapterDetails = await FS.readFile(
          `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapters[currentChapter].attributes.translatedLanguage}/${chapters[currentChapter].id}/chapter.json`,
        );
        const parsedDetails: ChapterDetails = JSON.parse(chapterDetails);

        setLocalFiles(parsedDetails.pageFileNames);
        return;
      }

      const data = await mangadexAPI<res_at_home_$, {}>(
        'get',
        '/at-home/server/$',
        {},
        [chapters[currentChapter].id],
      );

      if (data && data.result === 'ok') {
        setChapterPages(data);
      } else if (data && data.result === 'error') {
        dispatch(setError(data));
        console.error(`${data?.errors[0].status}: ${data?.errors[0].title}`);
        console.error(`${data?.errors[0].detail}`);
      } else {
        console.error('Fetching Error.');
      }
    })();
    setLoading(false);

    chapterOverlayOpacity.value = withSequence(
      withTiming(1, {duration: 100}),
      withTiming(1, {duration: 1500}),
      withTiming(0),
    );
  }, [
    chapterOverlayOpacity,
    chapters,
    currentChapter,
    dispatch,
    isDataSaver,
    jobs,
    mangaId,
  ]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', async () => {
      console.log('remove cached images');
      await FastImage.clearMemoryCache();
      await FastImage.clearDiskCache();
    });

    return () => unsubscribe();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gestures}>
        <View style={styles.container}>
          {!loading ? (
            <Animated.FlatList
              ref={listRef}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              data={
                local
                  ? localFiles
                  : isDataSaver
                  ? chapterPages?.chapter.dataSaver
                  : chapterPages?.chapter.data
              }
              horizontal={locReadingMode === READING_MODES.HORIZONTAL}
              snapToInterval={
                locReadingMode === READING_MODES.HORIZONTAL
                  ? width
                  : locReadingMode === READING_MODES.VERTICAL
                  ? height
                  : undefined
              }
              decelerationRate={'normal'}
              snapToAlignment={'start'}
              scrollEnabled={!showSettingsSheet}
              onScroll={onScroll}
              renderItem={renderItem}
              windowSize={locReadingMode !== READING_MODES.WEBTOON ? 5 : 3}
              initialNumToRender={2}
              maxToRenderPerBatch={
                locReadingMode !== READING_MODES.WEBTOON ? 5 : 2
              }
              removeClippedSubviews={false}
            />
          ) : (
            <View>
              <Progress.CircleSnail />
              <Text>loading</Text>
            </View>
          )}
        </View>
      </GestureDetector>

      <Animated.View style={[styles.chapterOverlay, chapterOverlayStyle]}>
        <Animated.Text style={styles.chapterOverlayTitleLabel}>
          {chapters[currentChapter].attributes.title
            ? chapters[currentChapter].attributes.title
            : 'Chapter ' + chapters[currentChapter].attributes.chapter}
        </Animated.Text>
        {chapters[currentChapter].attributes.title && (
          <Animated.Text style={styles.chapterOverlayChapLabel}>
            Chapter {chapters[currentChapter].attributes.chapter}
          </Animated.Text>
        )}
      </Animated.View>

      {showBottomOverlay && (
        <Animated.View
          entering={FadeInDown}
          exiting={FadeOutDown}
          style={styles.bottomOverlay}>
          {currentChapter !== 0 && (
            <GestureDetector gesture={prevBtnTap}>
              <Animated.View style={[styles.prevBtnContainer]}>
                <Animated.Text style={styles.nextPrevLabels}>
                  Prev Chapter
                </Animated.Text>
              </Animated.View>
            </GestureDetector>
          )}
          {currentChapter < chapters.length - 1 && (
            <GestureDetector gesture={nextBtnTap}>
              <Animated.View style={[styles.nextBtnContainer]}>
                <Animated.Text style={styles.nextPrevLabels}>
                  Next Chapter
                </Animated.Text>
              </Animated.View>
            </GestureDetector>
          )}
        </Animated.View>
      )}
      {locReadingMode !== 'webtoon' && (
        <Progress.Bar
          progress={
            chapterPages &&
            parseFloat(
              (
                (currentPage + 1) /
                chapterPages?.chapter.dataSaver.length
              ).toPrecision(3),
            )
          }
          style={styles.pageProgressBar}
          width={width}
          borderColor={white}
          color={white}
          height={1}
          borderWidth={0}
          borderRadius={0}
        />
      )}
      {showSettingsSheet && (
        <Animated.View
          entering={SlideInDown}
          exiting={SlideOutDown}
          style={[styles.settingsSheet, settingsSheetStyle]}>
          <ScrollView
            contentContainerStyle={styles.settingsSheetScrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}>
            <Text style={styles.settingsSheetHeader}>
              {chapters[currentChapter].attributes.title
                ? chapters[currentChapter].attributes.title
                : 'No Chapter Title'}
            </Text>
            <Text style={styles.settingsSheetSmall}>
              {chapters[currentChapter].id}
            </Text>
            <Text style={styles.settingsSheetSmall}>
              Chapter {chapters[currentChapter].attributes.chapter}
            </Text>

            <Text style={styles.settingsSheetSmall}>Scanlator: </Text>
            <Text style={styles.settingsSheetSmall}>
              Uploaded by User:{' '}
              {(user?.result === 'ok' && user.data.attributes.username) ??
                'No User Available'}
            </Text>

            <View style={styles.settingsSheetGroup}>
              <Text style={styles.settingsSheetSmall}>Reading Mode</Text>
              <GenericDropdown
                multiple={false}
                items={readingModes}
                value={locReadingMode}
                setValues={setLocReadingMode}
                onSelectionPress={() => {
                  console.log('pressed');
                  setShowBottomOverlay(false);
                }}
              />
            </View>
            <View style={styles.settingsSheetGroup}>
              <Text style={styles.settingsSheetSmall}>Chapter</Text>
              <GenericDropdown
                multiple={false}
                items={chapters.map((chapter, index) => {
                  return {
                    label: 'Chapter ' + chapter.attributes.chapter,
                    value: index,
                  };
                })}
                value={currentChapter}
                setValues={
                  setCurrentChapter as React.Dispatch<
                    SetStateAction<string | number | Array<string | number>>
                  >
                }
                onSelectionPress={() => {
                  setShowBottomOverlay(false);
                }}
              />
            </View>
            <View style={styles.settingsSheetGroupRow}>
              <Text style={styles.settingsSheetReg}>Data Saver</Text>
              <Switch
                value={isDataSaver}
                onValueChange={onDataSaverSwitchChange}
              />
            </View>

            <Button
              title="Go Back"
              onButtonPress={() => {
                navigation.goBack();
              }}
              containerStyle={{marginTop: 20}}
            />
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      backgroundColor: black,
    },
    bottomOverlay: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      position: 'absolute',
      bottom: 20,
      right: 0,
      left: 0,
    },
    chapterOverlay: {
      borderRadius: 15,
      backgroundColor: colorScheme.colors.main + 90,
      width: width * 0.6,
      position: 'absolute',
      bottom: height * 0.3,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
    },
    chapterOverlayTitleLabel: {
      color: textColor(colorScheme.colors.main),
      textAlign: 'center',
      fontFamily: PRETENDARD_JP.BOLD,
      fontSize: 18,
    },
    chapterOverlayChapLabel: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 8,
    },
    nextBtnContainer: {
      padding: 10,
      backgroundColor: colorScheme.colors.secondary,
    },
    prevBtnContainer: {
      padding: 10,
      backgroundColor: colorScheme.colors.secondary,
    },
    pageProgressBar: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: 0,
    },
    blurView: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    settingsSheet: {
      right: 0,
      bottom: 0,
      position: 'absolute',
      backgroundColor: colorScheme.colors.main,
      overflow: 'hidden',
    },
    settingsSheetScrollView: {
      padding: 20,
    },
    settingsSheetHeader: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.BOLD,
      fontSize: 18,
    },
    settingsSheetSmall: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 10,
    },
    settingsSheetReg: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 14,
    },
    nextPrevLabels: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 10,
    },
    settingsSheetGroup: {
      marginTop: 10,
      justifyContent: 'center',
    },
    settingsSheetGroupRow: {
      marginTop: 10,
      alignItems: 'center',
      flexDirection: 'row',
    },
  });
}
