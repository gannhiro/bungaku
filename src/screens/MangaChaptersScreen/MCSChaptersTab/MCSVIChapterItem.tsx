import {res_get_group_$, res_get_manga_$_feed, res_get_user_$} from '@api';
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
import {RootStackParamsList} from '@navigation';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {queueDownloadChapter, RootState, useAppDispatch, useAppSelector} from '@store';
import {textColor} from '@utils';
import React, {memo, useEffect, useState} from 'react';
import {Dimensions, Image, StyleSheet, Text, Vibration} from 'react-native';
import FS from 'react-native-fs';
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

const {width, height} = Dimensions.get('screen');

type Props = {
  chapter: res_get_manga_$_feed['data'][0];
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
  const navigation = useNavigation<NavigationProp<RootStackParamsList>>();
  const dispatch = useAppDispatch();

  const potentialJobId = `${manga?.id}-${chapter.id}`;
  const jobStatus = useAppSelector((state: RootState) => state.jobs.jobs[potentialJobId]?.status);
  const jobProgress = useAppSelector(
    (state: RootState) => state.jobs.jobs[potentialJobId]?.progress,
  );
  const {colorScheme} = useAppSelector((state: RootState) => state.userPreferences);
  const {libraryList} = useAppSelector((state: RootState) => state.libraryList);

  const isJobPending = jobStatus === 'pending' || jobStatus === 'queued';
  const styles = getStyles(colorScheme);

  const [downloadable, setDownloadable] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const inLibrary = libraryList.includes(manga?.id ?? '');
  const isSelected = selectedChapters.includes(chapter.id);
  const scanlator = chapter?.relationships.find(rs => rs.type === 'scanlation_group') as
    | res_get_group_$['data']
    | undefined;
  const user = chapter?.relationships.find(rs => rs.type === 'user') as
    | res_get_user_$['data']
    | undefined;

  // MARK: Animations and Gestures

  const chapterTranslationX = useSharedValue(0);
  const chapterPressableBG = useSharedValue('#0000');
  const chapterPressableBorderColor = useSharedValue('#0000');
  const chapterPressableStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: chapterPressableBG.value,
      transform: [{translateX: chapterTranslationX.value}],
      borderColor: chapterPressableBorderColor.value,
    };
  });

  const rightGroupWidth = useSharedValue(0);
  const rightGroupStyle = useAnimatedStyle(() => {
    return {
      width: rightGroupWidth.value,
      backgroundColor: isDownloaded ? systemRed : systemGreen,
    };
  });

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
      if (isJobPending) {
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
      console.log('long pressed');
      // runOnJS(onChapterLongPress)();
    });
  const panLeftGest = Gesture.Pan()
    .enabled(!isJobPending && !selectMode)
    .minVelocityX(-200)
    .onStart(() => {
      console.log('panned left');
    })
    .onChange(event => {
      if (event.translationX < -61 || event.translationX > 1) {
        return;
      }
      rightGroupWidth.value = Math.abs(event.translationX);
    })
    .onEnd(event => {
      if (event.translationX < -61) {
        console.log('swiped threshold reached');
        runOnJS(shouldDownloadChapter)();
      }
      rightGroupWidth.value = withTiming(0);
    })
    .enabled(downloadable);
  const gestures = Gesture.Race(tapGesture, longPressGest, panLeftGest);

  async function shouldDownloadChapter() {
    if (!manga) {
      return;
    }

    if (inLibrary) {
      dispatch(
        queueDownloadChapter({
          chapter,
          manga,
          isDataSaver: false,
        }),
      );
    } else {
      navigation.navigate('AddToLibraryModal', {
        manga,
        statistics: statistics ?? undefined,
      });
    }
  }

  async function onChapterLongPress() {
    const dirList = await FS.readdir(`${FS.DocumentDirectoryPath}/manga/`);
    console.log(dirList);

    if (!selectMode) {
      setSelectMode(true);
    }
    if (isSelected) {
      const temp = [...selectedChapters];
      temp.splice(selectedChapters.indexOf(chapter.id), 1);
      setSelectedChapters(temp);
    } else {
      setSelectedChapters([...selectedChapters, chapter.id]);
    }
  }

  function goToReadChapter() {
    if (selectMode) {
      if (isSelected) {
        const temp = [...selectedChapters];
        temp.splice(selectedChapters.indexOf(chapter.id), 1);
        setSelectedChapters(temp);
      } else {
        setSelectedChapters([...selectedChapters, chapter.id]);
      }
      return;
    }

    if (!manga) {
      return;
    }

    if (chapter.attributes.externalUrl) {
      InAppBrowser.open(chapter.attributes.externalUrl);
      return;
    }

    const chapterLang = chapter?.attributes.translatedLanguage;
    const tempChapters = chapters.filter(item => {
      if (item.attributes.translatedLanguage === chapterLang) {
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
      originalLanguage: manga.attributes.originalLanguage,
      initialChapterIndex: initialIndex,
    });
  }

  function getTimeReleased() {
    const dateNow = new Date().getTime();
    const timeInMs = dateNow - new Date(chapter.attributes.publishAt).getTime();

    const timeInSecs = Math.floor(timeInMs / 1000);
    const timeInMins = Math.floor(timeInMs / (1000 * 60));
    const timeInHours = Math.floor(timeInMs / (1000 * 60 * 60));
    const timeInDays = Math.floor(timeInMs / (1000 * 60 * 60 * 24));
    const timeInMonths = Math.floor(timeInMs / (1000 * 60 * 60 * 24 * 30));
    const timeInYears = Math.floor(timeInMs / (1000 * 60 * 60 * 24 * 30 * 12));

    if (timeInMonths > 12) {
      return timeInYears + ' years ago';
    }
    if (timeInDays > 30) {
      return timeInMonths + ' months ago';
    }
    if (timeInHours > 24) {
      return timeInDays + ' days ago';
    }
    if (timeInMins > 60) {
      return timeInHours + ' hours ago';
    }
    if (timeInSecs > 60) {
      return timeInMins + ' minutes ago';
    }

    return timeInSecs + ' seconds ago';
  }

  useEffect(() => {
    (async () => {
      const isDL = await FS.exists(
        `${FS.DocumentDirectoryPath}/manga/${manga?.id}/${chapter.attributes.translatedLanguage}/${chapter.id}`,
      );
      const isCD = await FS.exists(`${FS.CachesDirectoryPath}/${manga?.id}/${chapter.id}`);

      setIsDownloaded(isDL);

      chapterPressableBorderColor.value = isDL
        ? systemGreen
        : isCD
        ? systemOrange
        : colorScheme.colors.primary;

      const isChapterDownloadable = !chapter.attributes.externalUrl;
      setDownloadable(isChapterDownloadable);
    })();
  }, [chapter, manga, libraryList, chapterPressableBorderColor, colorScheme, jobStatus]);

  return (
    <GestureDetector gesture={gestures}>
      <Animated.View entering={FadeIn} style={[styles.container, chapterPressableStyle]}>
        {selectMode && (
          <Animated.View entering={SlideInLeft} style={[styles.leftCheckbox]}>
            {isSelected ? (
              <Image
                source={require('@assets/icons/checkbox-marked-outline.png')}
                style={styles.checkbox}
              />
            ) : (
              <Image
                source={require('@assets/icons/checkbox-blank-outline.png')}
                style={styles.checkbox}
              />
            )}
          </Animated.View>
        )}
        <Animated.View style={styles.leftGroup}>
          <Animated.View style={styles.topRow}>
            <FlagIcon language={chapter?.attributes.translatedLanguage} style={styles.flagIcon} />
            <Animated.Text
              style={[styles.chapterTitleLabel]}
              ellipsizeMode={'tail'}
              numberOfLines={1}>
              {chapter?.attributes.title
                ? chapter.attributes.title.length > 35
                  ? chapter?.attributes.title.slice(0, 35) + '...'
                  : chapter?.attributes.title
                : 'Chapter ' + chapter?.attributes.chapter}
            </Animated.Text>
          </Animated.View>
          <Animated.View style={styles.bottomRow}>
            <Animated.Text style={styles.chapterGenericLabel}>
              {'Chapter ' + chapter?.attributes.chapter + ' | '}
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
          {isDownloaded ? (
            <Image source={require('@assets/icons/close.png')} style={styles.rmIcon} />
          ) : (
            <Image source={require('@assets/icons/tray-arrow-down.png')} style={styles.dlIcon} />
          )}
        </Animated.View>
        {isJobPending && (
          <Progress.Bar
            style={styles.progBar}
            indeterminate={!jobProgress}
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
    bookIcon: {
      width: 30,
      height: 25,
      tintColor: textColor(colorScheme.colors.main),
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
      backgroundColor: systemGreen,
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
