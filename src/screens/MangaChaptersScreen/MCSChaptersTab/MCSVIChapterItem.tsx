import {res_get_group_$, res_get_user_$} from '@api';
import {FlagIcon} from '@components';
import {
  ColorScheme,
  PRETENDARD_JP,
  systemCyan,
  systemCyanLight,
  systemGreen,
  systemOrange,
  systemRed,
} from '@constants';
import {
  RootState,
  useAppSelector,
  queueChapterDownload,
  deleteChapterJob,
  selectJobs,
} from '@store';
import {textColor, useAppCore} from '@utils';
import React, {memo, useEffect, useState} from 'react';
import {Dimensions, Image, StyleSheet, Text, Vibration} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import * as Progress from 'react-native-progress';
import Animated, {
  FadeIn,
  runOnJS,
  SlideInLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {useMangaChaptersScreenContext} from '../useMangaChaptersScreenContext';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamsList} from '@navigation';
import {Chapter} from '@db';

const {width, height} = Dimensions.get('screen');

type Props = {
  chapter: Chapter;
};

export const MCSVIChapterItem = memo(({chapter}: Props) => {
  const {
    manga,
    order,
    chapters,
    statistics,
    selectMode,
    setSelectMode,
    selectedChapters,
    setSelectedChapters,
  } = useMangaChaptersScreenContext();
  const potentialJobId = `${manga?.id}-${chapter.id}`;

  const {colorScheme, dispatch} = useAppCore();
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamsList, 'MangaChaptersScreen'>>();
  const isInLibrary = useAppSelector((state: RootState) => state.libraryList).libraryList.includes(
    manga?.id ?? '',
  );
  const potentialJob = useAppSelector((state: RootState) => state.jobs.jobs[potentialJobId]);
  const styles = getStyles(colorScheme);

  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isCached, setIsCached] = useState(false);

  const isActiveOrQueued = potentialJob?.status === 'active' || potentialJob?.status === 'queued';
  const isSelected = selectedChapters.includes(chapter.id);
  const scanlator = chapter?.relationships.find(rs => rs.type === 'scanlation_group') as
    | res_get_group_$['data']
    | undefined;
  const user = chapter?.relationships.find(rs => rs.type === 'user') as
    | res_get_user_$['data']
    | undefined;

  const chapterTranslationX = useSharedValue(0);
  const chapterPressableBG = useSharedValue('#0000');
  const chapterPressableStyle = useAnimatedStyle(
    () => ({
      backgroundColor: chapterPressableBG.value,
      transform: [{translateX: chapterTranslationX.value}],
      borderColor: isDownloaded
        ? systemGreen
        : isCached
        ? systemOrange
        : colorScheme.colors.secondary,
    }),
    [isDownloaded, isCached, colorScheme],
  );

  const rightGroupWidth = useSharedValue(0);
  const rightGroupStyle = useAnimatedStyle(
    () => ({
      width: rightGroupWidth.value,
      backgroundColor: isDownloaded ? systemRed : systemGreen,
    }),
    [isDownloaded],
  );

  const tapGesture = Gesture.Tap()
    .onStart(() => {
      chapterPressableBG.value = withSequence(
        withTiming(colorScheme.colors.secondary + 99, {duration: 100}),
        withTiming('#0000'),
      );
      runOnJS(Vibration.vibrate)([0, 50], false);
    })
    .onEnd(() => {
      runOnJS(goToReadChapter)();
    });
  const longPressGest = Gesture.LongPress()
    .onStart(() => {
      if (potentialJob?.status === 'active') {
        return;
      }
      chapterPressableBG.value = withSequence(
        withTiming(colorScheme.colors.secondary + 99, {duration: 100}),
        withTiming('#0000'),
      );
      chapterTranslationX.value = withRepeat(
        withSequence(withTiming(2, {duration: 40}), withTiming(-2, {duration: 40})),
        4,
        false,
        finished => {
          if (finished) {
            chapterTranslationX.value = 0;
          }
        },
      );
    })
    .onEnd(() => {
      // runOnJS(onChapterLongPress)();
    });
  const panLeftGest = Gesture.Pan()
    .enabled(!(potentialJob?.status === 'active') && !selectMode)
    .minVelocityX(-200)
    .onChange(event => {
      if (event.translationX < -61 || event.translationX > 1) {
        return;
      }
      rightGroupWidth.value = Math.abs(event.translationX);
    })
    .onEnd(event => {
      if (event.translationX < -61) {
        runOnJS(handleSwipeAction)();
      }
      rightGroupWidth.value = withTiming(0);
    })
    .enabled(!!!chapter.externalUrl);

  const gestures = Gesture.Race(tapGesture, longPressGest, panLeftGest);

  function handleSwipeAction() {
    if (!manga) return;
    if (isDownloaded) {
      dispatch(deleteChapterJob({mangaId: manga.id, chapterId: chapter.id}));
      return;
    }
    shouldDownloadChapter();
  }

  function shouldDownloadChapter() {
    if (!manga) return;

    if (isInLibrary) {
      dispatch(queueChapterDownload({manga, chapter}));
      return;
    }

    navigation.navigate('AddToLibraryModal', {
      manga,
      statistics: statistics ?? undefined,
    });
  }

  function goToReadChapter() {
    if (selectMode) {
      if (isSelected) {
        const temp = [...selectedChapters];
        temp.splice(selectedChapters.indexOf(chapter.id), 1);
        return setSelectedChapters(temp);
      }

      return setSelectedChapters([...selectedChapters, chapter.id]);
    }

    if (!manga) return;

    if (chapter.externalUrl) return InAppBrowser.open(chapter.externalUrl);

    const chapterLang = chapter?.translatedLanguage;
    const tempChapters = chapters.filter(item => {
      if (item.translatedLanguage === chapterLang) {
        return item;
      }
    });
    const finalChapters = order === 'asc' ? tempChapters : tempChapters.reverse();

    let initialIndex =
      finalChapters.findIndex(item => {
        return item.id === chapter?.id;
      }) ?? 0;

    navigation.navigate('ReadChapterScreen', {
      manga,
      chapters: finalChapters,
      originalLanguage: manga.originalLanguage,
      initialChapterIndex: initialIndex,
    });
  }

  function getTimeReleased() {
    const timeInMs = Date.now() - new Date(chapter.publishAt).getTime();
    const timeInDays = Math.floor(timeInMs / (1000 * 60 * 60 * 24));
    if (timeInDays > 365) return `${Math.floor(timeInDays / 365)}y ago`;
    if (timeInDays > 30) return `${Math.floor(timeInDays / 30)}mo ago`;
    if (timeInDays > 0) return `${timeInDays}d ago`;
    const timeInHours = Math.floor(timeInMs / (1000 * 60 * 60));
    if (timeInHours > 0) return `${timeInHours}h ago`;
    const timeInMins = Math.floor(timeInMs / (1000 * 60));
    if (timeInMins > 0) return `${timeInMins}m ago`;
    return `${Math.floor(timeInMs / 1000)}s ago`;
  }

  const jobProgress = (potentialJob?.progress ?? 0) / chapter.pages;

  useEffect(() => {
    const subscription = chapter.observe().subscribe(updatedChapter => {
      const cached = !updatedChapter.isDownloaded && updatedChapter.fileNames.length > 0;
      setIsDownloaded(updatedChapter.isDownloaded);
      setIsCached(cached);
    });
    return () => subscription.unsubscribe();
  }, [chapter]);

  return (
    <GestureDetector gesture={gestures}>
      <Animated.View entering={FadeIn} style={[styles.container, chapterPressableStyle]}>
        {selectMode && (
          <Animated.View entering={SlideInLeft} style={[styles.leftCheckbox]}>
            <Image
              source={
                isSelected
                  ? require('@assets/icons/checkbox-marked-outline.png')
                  : require('@assets/icons/checkbox-blank-outline.png')
              }
              style={styles.checkbox}
            />
          </Animated.View>
        )}
        <Animated.View style={styles.leftGroup}>
          <Animated.View style={styles.topRow}>
            <FlagIcon language={chapter?.translatedLanguage} style={styles.flagIcon} />
            <Animated.Text
              style={[styles.chapterTitleLabel]}
              ellipsizeMode={'tail'}
              numberOfLines={1}>
              {chapter?.title
                ? chapter.title.length > 35
                  ? chapter?.title.slice(0, 35) + '...'
                  : chapter?.title
                : 'Chapter ' + chapter?.chapterNumber}
            </Animated.Text>
          </Animated.View>
          <Animated.View style={styles.bottomRow}>
            <Animated.Text style={styles.chapterGenericLabel}>
              {'Chapter ' + chapter?.chapterNumber + ' | '}
              {getTimeReleased()}
            </Animated.Text>
          </Animated.View>
          <Animated.View style={styles.bottomRow}>
            {scanlator && (
              <>
                <Image
                  source={require('@assets/icons/account-multiple-outline.png')}
                  style={styles.accountIcon}
                />
                <Text style={styles.scanlatorLabel}>{scanlator?.attributes.name}</Text>
              </>
            )}
            {user && (
              <>
                <Image
                  source={require('@assets/icons/account-outline.png')}
                  style={styles.accountIcon}
                />
                <Text style={styles.scanlatorLabel}>{user?.attributes.username}</Text>
              </>
            )}
          </Animated.View>
        </Animated.View>
        <Animated.View style={[styles.rightGroup, rightGroupStyle]}>
          <Image
            source={
              isDownloaded
                ? require('@assets/icons/close.png')
                : require('@assets/icons/tray-arrow-down.png')
            }
            style={isDownloaded ? styles.rmIcon : styles.dlIcon}
          />
        </Animated.View>
        {isActiveOrQueued && (
          <Progress.Bar
            style={styles.progBar}
            indeterminate={potentialJob?.status === 'queued'}
            progress={jobProgress}
            borderWidth={0}
            height={3}
            width={width - 40}
            color={systemCyan}
          />
        )}
      </Animated.View>
    </GestureDetector>
  );
});

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      zIndex: 0,
      borderRadius: 10,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      overflow: 'hidden',
      height: height / 13,
      minHeight: 60,
      paddingLeft: 10,
    },
    leftCheckbox: {
      width: 20,
      alignItems: 'center',
      overflow: 'hidden',
      marginRight: 10,
    },
    leftGroup: {
      flex: 1,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    flagIcon: {width: 20, height: 15},
    bottomRow: {flexDirection: 'row'},
    chapterTitleLabel: {
      fontFamily: PRETENDARD_JP.BOLD,
      color: textColor(colorScheme.colors.main),
      marginLeft: 5,
      fontSize: 16,
    },
    chapterGenericLabel: {
      fontFamily: PRETENDARD_JP.REGULAR,
      color: textColor(colorScheme.colors.main),
      fontSize: 9,
    },
    scanlatorLabel: {
      fontFamily: PRETENDARD_JP.REGULAR,
      color: systemCyanLight,
      fontSize: 9,
      marginRight: 3,
    },
    accountIcon: {
      width: 12,
      height: 12,
      tintColor: textColor(colorScheme.colors.main),
    },
    progBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    rightGroup: {
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    dlIcon: {
      width: 20,
      height: 20,
      tintColor: textColor(systemGreen),
    },
    rmIcon: {
      width: 20,
      height: 20,
      tintColor: textColor(systemRed),
    },
    checkbox: {
      width: 20,
      height: 20,
      tintColor: textColor(colorScheme.colors.main),
    },
  });
}

export default MCSVIChapterItem;
