import {ORDER, res_get_author_$, res_get_manga_$_feed} from '@api';
import {
  BigIconButton,
  BottomSheet,
  Dropdown,
  GenericDropdownValues,
  MangaListRenderItemContRatIcon,
  MangaListRenderItemStatIcon,
} from '@components';
import {ColorScheme, ISO_LANGS, PRETENDARD_JP, TOP_OVERLAY_HEIGHT} from '@constants';
import Clipboard from '@react-native-clipboard/clipboard';
import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {FlashList, ListRenderItemInfo} from '@shopify/flash-list';
import {textColor, useAppCore} from '@utils';
import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Progress from 'react-native-progress';
import Animated, {
  EntryAnimationsValues,
  EntryExitAnimationFunction,
  ExitAnimationsValues,
  FadeIn,
  FadeOut,
  LayoutAnimation,
  LinearTransition,
  withTiming,
} from 'react-native-reanimated';
import {MCSBottomTabsParamsList} from '../MangaChaptersScreen';
import {useMangaChaptersScreenContext} from '../useMangaChaptersScreenContext';
import MCSVIChapterItem from './MCSVIChapterItem';
import {Chapter} from '@db';
import {RootState, useAppSelector} from '@store';

type Props = MaterialTopTabScreenProps<MCSBottomTabsParamsList, 'MCSChaptersTab'>;

const {height, width} = Dimensions.get('screen');

export function MCSChaptersTab({}: Props) {
  const {
    manga,
    chapters,
    onAddToLibPress,
    loading,
    loadingProgress,
    loadingText,
    showDownloadedChapters,
    setShowDownloadedChapters,
    order,
    setOrder,
  } = useMangaChaptersScreenContext();

  const {colorScheme} = useAppCore();
  const isInLibrary = useAppSelector((state: RootState) => state.libraryList).libraryList.includes(
    manga?.id ?? '',
  );

  const styles = getStyles(colorScheme);

  const listRef = useRef<FlashList<Chapter>>(null);

  const availableLanguages: GenericDropdownValues =
    manga?.availableTranslatedLanguages.map(lang => {
      return {
        value: lang,
        label: lang ? ISO_LANGS[lang as keyof typeof ISO_LANGS].name : 'NULL',
        subLabel: `${lang ? ISO_LANGS[lang as keyof typeof ISO_LANGS].nativeName : 'NULL'} | ${
          lang ?? 'NULL'
        }`,
      };
    }) ?? [];

  const author = manga?.relationships.find(rs => rs.type === 'author') as res_get_author_$['data'];
  const [languages, setLanguages] = useState<string[]>([]);
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
  const [mangaTitle, setMangaTitle] = useState<string>();

  const topContEnterLayoutAnim: EntryExitAnimationFunction = (
    targetValues: EntryAnimationsValues,
  ) => {
    'worklet';
    const initialValues: LayoutAnimation['initialValues'] = {
      height: 0,
    };

    const animations: LayoutAnimation['animations'] = {
      height: withTiming(targetValues.targetHeight, {duration: 250}),
    };

    return {
      initialValues,
      animations,
    };
  };

  const topContExitLayoutAnim: EntryExitAnimationFunction = (
    currentValues: ExitAnimationsValues,
  ) => {
    'worklet';
    const initialValues: LayoutAnimation['initialValues'] = {
      height: currentValues.currentHeight,
    };

    const animations: LayoutAnimation['animations'] = {
      height: withTiming(0, {duration: 250}),
    };

    return {
      initialValues,
      animations,
    };
  };

  function renderItem({item}: ListRenderItemInfo<Chapter>) {
    return <MCSVIChapterItem chapter={item} />;
  }

  async function onPressShare() {
    const url = `https://www.mangadex.org/title/${manga?.id}`;
    Clipboard.setString(url);
  }

  function onPressFilterIcon() {
    setShowBottomSheet(!showBottomSheet);
  }

  function onPressShowDownloadedChaptersSwitch() {
    setShowDownloadedChapters(!showDownloadedChapters);
  }

  function onPressOrderSwitch() {
    if (order === ORDER.ASCENDING) {
      setOrder(ORDER.DESCENDING);
    }
    if (order === ORDER.DESCENDING) {
      setOrder(ORDER.ASCENDING);
    }
  }

  useEffect(() => {
    (async () => {
      const title = await manga?.getPreferredTitle();
      setMangaTitle(title ?? '');
    })();
  }, [manga]);

  return (
    <View style={[styles.container]}>
      <Animated.View layout={LinearTransition} style={styles.detailsContainer}>
        <Animated.Text style={[styles.mangaTitle]} entering={FadeIn} numberOfLines={5}>
          {mangaTitle}
        </Animated.Text>
        <Text style={[styles.mangaAuthor]} numberOfLines={2}>
          {author?.attributes?.name ? `by ${author.attributes.name ?? ''}` : 'No Author'}
        </Text>
        <ScrollView
          horizontal
          style={styles.horizontalPressables}
          contentContainerStyle={{alignItems: 'center'}}>
          <BigIconButton
            icon={
              isInLibrary
                ? require('@assets/icons/book.png')
                : require('@assets/icons/book-outline.png')
            }
            onPressButton={onAddToLibPress}
          />
          <BigIconButton
            icon={require('@assets/icons/share-variant.png')}
            onPressButton={onPressShare}
          />
          <MangaListRenderItemContRatIcon
            contentRating={manga?.contentRating ?? 'safe'}
            style={styles.pressableIcons}
          />
          <MangaListRenderItemStatIcon
            status={manga?.status ?? 'ongoing'}
            style={styles.pressableIcons}
          />
        </ScrollView>
      </Animated.View>
      {chapters.length ? (
        <Animated.View style={styles.flashListContainer}>
          <FlashList
            ref={listRef}
            contentContainerStyle={styles.chapListContent}
            data={chapters.filter(chapter => {
              let shouldReturn = true;
              if (languages.length > 0 && !languages.includes(chapter.translatedLanguage)) {
                shouldReturn = false;
              }

              return shouldReturn;
            })}
            renderItem={renderItem}
            showsVerticalScrollIndicator={true}
            estimatedItemSize={height / 13 + 10}
            estimatedListSize={{height, width}}
          />
        </Animated.View>
      ) : (
        <Animated.View style={styles.loadingContainer} entering={FadeIn} exiting={FadeOut}>
          <Progress.Circle
            indeterminate={loadingProgress === 0}
            progress={loadingProgress}
            size={width * 0.3}
            thickness={2}
            borderWidth={0}
            color={textColor(colorScheme.colors.main)}
            style={styles.loadingCircleSnail}
          />
          <Text style={styles.loadingLabel}>{loadingText}</Text>
        </Animated.View>
      )}
      <BottomSheet
        showBottomSheet={showBottomSheet}
        setShowBottomSheet={setShowBottomSheet}
        style={styles.bottomSheet}>
        <ScrollView contentContainerStyle={styles.bottomSheetScrollView}>
          {isInLibrary && (
            <Animated.View style={styles.bottomSheetGroupRow} layout={LinearTransition}>
              <Text style={styles.bottomSheetLabel}>Downloaded Chapters Only</Text>
              <Switch
                value={showDownloadedChapters}
                onChange={onPressShowDownloadedChaptersSwitch}
              />
            </Animated.View>
          )}
          {availableLanguages.length > 1 && (
            <Animated.View style={styles.bottomSheetGroup} layout={LinearTransition}>
              <Text style={styles.bottomSheetLabel}>Languages</Text>
              <Dropdown
                items={availableLanguages}
                selection={languages}
                setSelection={setLanguages}
              />
            </Animated.View>
          )}
          <Animated.View style={styles.bottomSheetGroupRow} layout={LinearTransition}>
            <Text style={styles.bottomSheetLabel}>
              {order === ORDER.ASCENDING ? 'Ascending' : 'Descending'}
            </Text>
            <Switch value={order === ORDER.DESCENDING} onChange={onPressOrderSwitch} />
          </Animated.View>
        </ScrollView>
      </BottomSheet>
      {!loading && (
        <Animated.View style={[styles.filterContainer]} entering={FadeIn} exiting={FadeOut}>
          <TouchableOpacity onPress={onPressFilterIcon}>
            <Animated.Image
              source={require('@assets/icons/filter-multiple.png')}
              style={styles.filterIcon}
            />
          </TouchableOpacity>
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
      justifyContent: 'flex-start',
    },
    detailsContainer: {
      marginTop: TOP_OVERLAY_HEIGHT + 5,
      marginBottom: 20,
      alignSelf: 'stretch',
      paddingHorizontal: 20,
    },
    mangaTitle: {
      fontFamily: 'OtomanopeeOne-Regular',
      fontSize: 24,
      color: textColor(colorScheme.colors.main),
      width: '80%',
    },
    mangaAuthor: {
      fontFamily: PRETENDARD_JP.LIGHT,
      fontSize: 11,
      color: textColor(colorScheme.colors.main),
    },
    mangaTitleLang: {
      fontFamily: PRETENDARD_JP.LIGHT,
      fontSize: 16,
      marginRight: 5,
      color: textColor(colorScheme.colors.main),
    },
    dotsIconCont: {
      position: 'absolute',
      top: TOP_OVERLAY_HEIGHT,
      right: 20,
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: '50%',
    },
    loadingCircleSnail: {
      marginBottom: 10,
    },
    loadingLabel: {
      fontFamily: PRETENDARD_JP.REGULAR,
      textAlign: 'center',
      fontSize: 14,
      color: textColor(colorScheme.colors.main),
    },
    chapListContent: {
      paddingHorizontal: 20,
      paddingBottom: 75,
    },
    horizontalPressables: {
      marginTop: 10,
    },
    filterContainer: {
      position: 'absolute',
      right: 15,
      bottom: 15,

      width: width / 7,
      height: width / 7,
      padding: 10,

      backgroundColor: colorScheme.colors.primary,
      borderRadius: 100,

      elevation: 5,
      overflow: 'hidden',

      zIndex: 1000,
    },
    filterIcon: {
      width: '100%',
      height: '100%',
      tintColor: textColor(colorScheme.colors.primary),
    },
    bottomSheet: {
      flex: 1,
    },
    bottomSheetScrollView: {
      flexGrow: 1,
      padding: 15,
      paddingBottom: 80,
    },
    bottomSheetGroup: {
      alignItems: 'stretch',
      justifyContent: 'center',
      marginBottom: 10,
    },
    bottomSheetGroupRow: {
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      marginBottom: 10,
    },
    bottomSheetLabel: {
      fontSize: 12,
      fontFamily: PRETENDARD_JP.SEMIBOLD,
      color: textColor(colorScheme.colors.main),
      marginBottom: 5,
    },
    pressableIcons: {
      width: 30,
      height: 30,
      marginRight: 5,
      padding: 10,
    },
    langDropdown: {
      position: 'absolute',
      right: 20,
      bottom: 0,
    },
    flashListContainer: {
      flex: 1,
      alignSelf: 'stretch',
      alignItems: 'stretch',
    },
  });
}
