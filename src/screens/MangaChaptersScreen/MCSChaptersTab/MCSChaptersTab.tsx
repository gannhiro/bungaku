import {res_get_author_$, res_get_manga_$_feed} from '@api';
import {
  ColorScheme,
  ISO_LANGS,
  PRETENDARD_JP,
  TOP_OVERLAY_HEIGHT,
  white,
} from '@constants';
import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {RootState} from '@store';
import {textColor} from '@utils';
import React, {useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Progress from 'react-native-progress';
import Animated, {
  FadeIn,
  Layout,
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';
import {useSelector} from 'react-redux';
import {MCSBottomTabsParamsList} from '../MangaChaptersScreen';
import MCSVIChapterItem from './MCSVIChapterItem';
import {FlashList, ListRenderItemInfo} from '@shopify/flash-list';
import {
  GenericDropdown,
  GenericDropdownValues,
  MangaListRenderItemContRatIcon,
  MangaListRenderItemStatIcon,
} from '@components';
import Clipboard from '@react-native-clipboard/clipboard';
import {useMangaChaptersScreenContext} from '../useMangaChaptersScreenContext';

type Props = MaterialTopTabScreenProps<
  MCSBottomTabsParamsList,
  'MCSChaptersTab'
>;

const {height, width} = Dimensions.get('screen');

export function MCSChaptersTab({}: Props) {
  const jobs = useSelector((state: RootState) => state.jobs);
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const {libraryList} = useSelector((state: RootState) => state.libraryList);
  const styles = getStyles(colorScheme);
  const {manga, chapters, onAddToLibPress, loading} =
    useMangaChaptersScreenContext();

  const listRef = useRef<FlashList<res_get_manga_$_feed['data'][0]>>(null);

  const availableLanguages: GenericDropdownValues =
    manga.attributes.availableTranslatedLanguages.map(lang => {
      return {
        value: lang,
        label: ISO_LANGS[lang as keyof typeof ISO_LANGS].name,
        subLabel: `${
          ISO_LANGS[lang as keyof typeof ISO_LANGS].nativeName
        } | ${lang}`,
      };
    });
  const addingLibLoad = jobs.some(id => id === manga.id);
  const inLibrary = libraryList.some(id => manga.id === id);
  const author = manga.relationships.find(
    rs => rs.type === 'author',
  ) as res_get_author_$['data'];

  const [showTopContainer, setShowTopContainer] = useState(true);
  const [languages, setLanguages] = useState<string[]>([]);

  function renderItem({
    item,
  }: ListRenderItemInfo<res_get_manga_$_feed['data'][0]>) {
    return <MCSVIChapterItem chapter={item} />;
  }

  function onScrollChapterList(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (!event.nativeEvent.velocity?.y) {
      return;
    }
    if (event.nativeEvent.contentOffset.y < 150) {
      setShowTopContainer(true);
      return;
    }
    if (event.nativeEvent.velocity.y > 0) {
      setShowTopContainer(false);
      return;
    }
    if (event.nativeEvent.velocity.y < 0) {
      setShowTopContainer(true);
      return;
    }
  }

  async function onPressShare() {
    const url = `https://www.mangadex.org/title/${manga.id}`;
    Clipboard.setString(url);
  }

  return (
    <View style={[styles.container]}>
      <Animated.View
        style={styles.detailsContainer}
        entering={SlideInUp}
        exiting={SlideOutUp}>
        <Animated.Text style={[styles.mangaTitle]} entering={FadeIn}>
          {manga.attributes.title.en
            ? manga.attributes.title.en
            : Object.values(manga.attributes.title)[0] ?? 'No Title'}
        </Animated.Text>
        <Text style={[styles.mangaAuthor]} numberOfLines={2}>
          {author.attributes.name
            ? 'by ' + author.attributes.name
            : 'No Author'}
        </Text>
        <ScrollView
          horizontal
          style={styles.horizontalPressables}
          contentContainerStyle={{alignItems: 'center'}}>
          <TouchableOpacity
            style={styles.libraryIconPressable}
            disabled={loading}
            onPress={onAddToLibPress}>
            {!addingLibLoad ? (
              inLibrary ? (
                <Image
                  source={require('@assets/icons/book.png')}
                  style={styles.libraryIcon}
                />
              ) : (
                <Image
                  source={require('@assets/icons/book-outline.png')}
                  style={styles.libraryIcon}
                />
              )
            ) : (
              <Progress.CircleSnail
                indeterminate
                size={30}
                color={colorScheme.colors.primary}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.libraryIconPressable}
            onPress={onPressShare}>
            <Image
              source={require('@assets/icons/share-variant.png')}
              style={styles.libraryIcon}
            />
          </TouchableOpacity>
          <MangaListRenderItemContRatIcon
            contentRating={manga.attributes.contentRating}
            style={styles.pressableIcons}
          />
          <MangaListRenderItemStatIcon
            status={manga.attributes.status}
            style={styles.pressableIcons}
          />
          <GenericDropdown
            items={availableLanguages}
            selection={languages}
            setSelection={setLanguages}
          />
        </ScrollView>
      </Animated.View>
      {!loading ? (
        <Animated.View layout={Layout}>
          <FlashList
            ref={listRef}
            contentContainerStyle={styles.chapListContent}
            data={chapters}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            estimatedItemSize={height / 13 + 10}
            estimatedListSize={{height, width}}
            onScroll={onScrollChapterList}
          />
        </Animated.View>
      ) : (
        <Progress.CircleSnail
          indeterminate
          size={width * 0.3}
          color={colorScheme.colors.primary}
          style={styles.loading}
        />
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
      fontSize: 36,
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
    libraryIconPressable: {
      padding: 5,
      borderWidth: 2,
      borderColor: colorScheme.colors.primary,
      borderRadius: 8,
      marginRight: 10,
    },
    libraryIcon: {
      height: 30,
      width: 30,
      tintColor: colorScheme.colors.primary,
    },
    dotsIconCont: {
      position: 'absolute',
      top: TOP_OVERLAY_HEIGHT,
      right: 20,
    },
    dotsIcon: {
      height: 30,
      width: 30,
      tintColor: white,
    },
    loading: {
      position: 'absolute',
      top: '50%',
    },
    chapListContent: {
      paddingHorizontal: 20,
      paddingBottom: 55,
    },
    horizontalPressables: {
      marginTop: 10,
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
  });
}
