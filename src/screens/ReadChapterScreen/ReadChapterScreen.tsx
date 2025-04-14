import {
  mangadexAPI,
  res_at_home_$,
  res_get_group_$,
  res_get_user_$,
} from '@api';
import {GenericDropdownValues} from '@components';
import {ColorScheme, PRETENDARD_JP, white} from '@constants';
import {RootStackParamsList} from '@navigation';
import {StackScreenProps} from '@react-navigation/stack';
import {
  cacheChapter,
  RootState,
  setError,
  useAppDispatch,
  useAppSelector,
} from '@store';
import {DownloadedChapterDetails} from '@types';
import {textColor} from '@utils';
import React, {Fragment, useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Vibration,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import FS from 'react-native-fs';
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import * as Progress from 'react-native-progress';
import Animated, {
  runOnJS,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {RCSBottomSheet} from './RCSBottomSheet';
import {RCSChapterImages} from './RCSChapterImages';
import {
  ReadChapterScreenContext,
  iReadChapterScreenContext,
} from './useReadChapterScreenContext';
import {useFocusEffect} from '@react-navigation/native';

type Props = StackScreenProps<RootStackParamsList, 'ReadChapterScreen'>;
export enum READING_MODES {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  WEBTOON = 'webtoon',
}
export type ReadingMode = `${READING_MODES}`;
const readingModes: GenericDropdownValues = [
  {label: 'Horizontal', value: READING_MODES.HORIZONTAL},
  {label: 'Vertical', value: READING_MODES.VERTICAL},
  {label: 'Webtoon', value: READING_MODES.WEBTOON},
];

const {width, height} = Dimensions.get('screen');

export function ReadChapterScreen({route, navigation}: Props) {
  const dispatch = useAppDispatch();
  const {mangaId, chapters, originalLanguage, initialChapterIndex} =
    route.params;
  const {colorScheme, preferDataSaver} = useAppSelector(
    (state: RootState) => state.userPreferences,
  );
  const jobs = useAppSelector((state: RootState) => state.jobs);
  const styles = getStyles(colorScheme);

  const [locReadingMode, setLocReadingMode] = useState<ReadingMode>(
    originalLanguage === 'ko' || originalLanguage === 'ko-ro'
      ? 'webtoon'
      : 'horizontal',
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [chapterPages, setChapterPages] = useState<res_at_home_$>();
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(initialChapterIndex);
  const [showBottomOverlay, setShowBottomOverlay] = useState(false);
  const [isDataSaver, setIsDataSaver] = useState(preferDataSaver);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<
    {pagePromise?: Promise<FS.DownloadResult>; path: string}[]
  >([]);

  const cacheDirectory = `${FS.CachesDirectoryPath}/${mangaId}/${chapters[currentChapter].id}`;
  const downloadsDirectory = `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapters[currentChapter].attributes.translatedLanguage}/${chapters[currentChapter].id}`;

  const scanlator = chapters[currentChapter].relationships.find(
    rs => rs.type === 'scanlation_group',
  ) as res_get_group_$['data'] | undefined;

  const user = chapters[currentChapter].relationships.find(
    rs => rs.type === 'user',
  ) as res_get_user_$['data'] | undefined;

  const listRef = useRef<FlatList<string>>(null);

  const swipeUp = Gesture.Fling()
    .enabled(locReadingMode === READING_MODES.HORIZONTAL)
    .direction(Directions.UP)
    .onEnd(() => {
      console.log('swiped up!');
      runOnJS(setShowSettingsSheet)(!showSettingsSheet);
    });

  const swipeLeft = Gesture.Fling()
    .enabled(locReadingMode !== READING_MODES.HORIZONTAL)
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
      if (locReadingMode === READING_MODES.WEBTOON) {
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

  const gestures = Gesture.Race(swipeUp, swipeLeft, listTap);

  const chapterOverlayOpacity = useSharedValue(1);
  const chapterOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: chapterOverlayOpacity.value,
    };
  });

  function renderItem({
    item,
  }: ListRenderItemInfo<{
    pagePromise?: Promise<FS.DownloadResult>;
    path: string;
  }>) {
    return (
      <RCSChapterImages
        pagePromise={item.pagePromise}
        path={item.path}
        readingMode={locReadingMode}
      />
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

  const context: iReadChapterScreenContext = {
    navigation,
    chapters,
    currentChapter,
    setCurrentChapter,
    scanlator,
    user,
    readingModes,
    locReadingMode,
    setLocReadingMode,
    setShowBottomOverlay,
    isDataSaver,
    onDataSaverSwitchChange,
  };

  useEffect(() => {
    setLoading(true);
    setCurrentPage(0);

    (async () => {
      await FastImage.clearMemoryCache();
      await FastImage.clearDiskCache();

      const isCurrentJob = jobs.includes(chapters[currentChapter].id);
      const isDownloaded = await FS.exists(
        `${FS.DocumentDirectoryPath}/manga/${mangaId}/${chapters[currentChapter].attributes.translatedLanguage}/${chapters[currentChapter].id}/chapter.json`,
      );

      if (!isCurrentJob && isDownloaded) {
        console.log('chapter is downloaded');
        const chapterDetails = await FS.readFile(
          `${downloadsDirectory}/chapter.json`,
        );
        const parsedDetails: DownloadedChapterDetails =
          JSON.parse(chapterDetails);

        const finalPageObjects = parsedDetails.pageFileNames.map(item => {
          return {
            path: `file://${downloadsDirectory}/${item}`,
          };
        });

        setLoading(false);
        setPages(finalPageObjects);
        return;
      }

      const isCached = await FS.exists(cacheDirectory);
      if (isCached) {
        console.log('chapter is cached');
        const chapterDetails: DownloadedChapterDetails = JSON.parse(
          await FS.readFile(`${cacheDirectory}/chapter.json`),
        );

        const finalPageObjects = chapterDetails.pageFileNames.map(item => {
          return {
            path: `file://${cacheDirectory}/${item}`,
          };
        });

        setPages(finalPageObjects);
        setLoading(false);
        return;
      }

      function cacheChapterCallback(
        tempPages: {pagePromise?: Promise<FS.DownloadResult>; path: string}[],
        tempChapters: res_at_home_$,
      ) {
        setPages(tempPages);
        setChapterPages(tempChapters);
        setLoading(false);
      }

      dispatch(
        cacheChapter({
          chapter: chapters[currentChapter],
          mangaId,
          isDataSaver,
          callback: cacheChapterCallback,
        }),
      );
    })();

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
    locReadingMode,
    cacheDirectory,
    downloadsDirectory,
  ]);

  useFocusEffect(() => {
    const backHandlerSub = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (showSettingsSheet) {
          setShowSettingsSheet(false);
          return true;
        }

        FastImage.clearMemoryCache();
        FastImage.clearDiskCache();
        return false;
      },
    );

    return () => backHandlerSub.remove();
  });

  return (
    <ReadChapterScreenContext.Provider value={context}>
      <View style={styles.container}>
        <GestureDetector gesture={gestures}>
          <View style={styles.container}>
            {!loading ? (
              <FlatList
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                data={pages}
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
                keyExtractor={item => item.path}
                maxToRenderPerBatch={10}
              />
            ) : (
              <Progress.CircleSnail style={styles.loadingCircleSnail} />
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
          <Fragment>
            {currentChapter !== 0 && (
              <GestureDetector gesture={prevBtnTap}>
                <Animated.View
                  style={[styles.prevBtnContainer]}
                  entering={SlideInLeft}
                  exiting={SlideOutLeft}>
                  <Animated.Text style={styles.nextPrevLabels}>
                    Prev Chapter
                  </Animated.Text>
                </Animated.View>
              </GestureDetector>
            )}
            {currentChapter < chapters.length - 1 && (
              <GestureDetector gesture={nextBtnTap}>
                <Animated.View
                  style={[styles.nextBtnContainer]}
                  entering={SlideInRight}
                  exiting={SlideOutRight}>
                  <Animated.Text style={styles.nextPrevLabels}>
                    Next Chapter
                  </Animated.Text>
                </Animated.View>
              </GestureDetector>
            )}
          </Fragment>
        )}

        {locReadingMode !== 'webtoon' && (
          <Progress.Bar
            progress={
              chapterPages &&
              (currentPage + 1) / chapterPages?.chapter.dataSaver.length
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
        <RCSBottomSheet
          showBottomSheet={showSettingsSheet}
          setShowBottomSheet={setShowSettingsSheet}
        />
      </View>
    </ReadChapterScreenContext.Provider>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'stretch',
      justifyContent: 'center',
      width: '100%',
      backgroundColor: colorScheme.colors.main,
    },
    chapterOverlay: {
      borderRadius: 15,
      backgroundColor: colorScheme.colors.main + 90,
      width: width * 0.6,
      position: 'absolute',
      bottom: height * 0.3,
      alignSelf: 'center',
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
      position: 'absolute',
      bottom: 20,
      right: 0,
      padding: 10,
      backgroundColor: colorScheme.colors.secondary,
    },
    prevBtnContainer: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      padding: 10,
      backgroundColor: colorScheme.colors.secondary,
    },
    pageProgressBar: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: 0,
    },
    loadingCircleSnail: {
      alignSelf: 'center',
    },
    nextPrevLabels: {
      color: textColor(colorScheme.colors.primary),
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 10,
    },
  });
}
