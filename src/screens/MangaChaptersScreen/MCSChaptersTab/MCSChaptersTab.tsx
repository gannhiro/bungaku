import {res_get_author_$, res_get_manga_$_feed} from '@api';
import {
  ColorScheme,
  PRETENDARD_JP,
  TOP_OVERLAY_HEIGHT,
  white,
} from '@constants';
import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {RootState} from '@store';
import {textColor} from '@utils';
import React, {useRef} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Progress from 'react-native-progress';
import Animated, {FadeIn} from 'react-native-reanimated';
import {useSelector} from 'react-redux';
import {MCSBottomTabsParamsList} from '../MangaChaptersScreen';
import MCSVIChapterItem from './MCSVIChapterItem';
import {FlashList, ListRenderItemInfo} from '@shopify/flash-list';
import {
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

  const addingLibLoad = jobs.some(id => id === manga.id);
  const author = manga.relationships.find(
    rs => rs.type === 'author',
  ) as res_get_author_$['data'];

  function renderItem({
    item,
  }: ListRenderItemInfo<res_get_manga_$_feed['data'][0]>) {
    return <MCSVIChapterItem chapter={item} />;
  }

  async function onPressShare() {
    const url = `https://www.mangadex.org/title/${manga.id}`;
    Clipboard.setString(url);
  }

  return (
    <View style={[styles.container]}>
      {!loading ? (
        <FlashList
          ListHeaderComponent={
            <View style={styles.detailsContainer}>
              <Animated.Text
                style={[styles.mangaTitle]}
                entering={FadeIn}
                numberOfLines={2}>
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
                  onPress={onAddToLibPress}>
                  {!addingLibLoad ? (
                    libraryList.some(id => manga.id === id) ? (
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
              </ScrollView>
            </View>
          }
          ref={listRef}
          contentContainerStyle={styles.chapListContent}
          data={chapters}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={height / 14}
          estimatedListSize={{height, width}}
        />
      ) : (
        <Progress.CircleSnail
          indeterminate
          size={width * 0.3}
          color={colorScheme.colors.primary}
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
      justifyContent: 'center',
    },
    detailsContainer: {
      marginTop: TOP_OVERLAY_HEIGHT + 5,
      marginBottom: 20,
    },
    mangaTitle: {
      fontFamily: 'OtomanopeeOne-Regular',
      fontSize: 20,
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
    chapList: {
      flex: 1,
      zIndex: 0,
      width: width,
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
