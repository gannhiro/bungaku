import {
  CONTENT_RATING,
  ContentRating,
  MANGA_STATUS,
  MangaStatus,
  PUBLICATION_DEMOGRAPHIC,
  PublicationDemographic,
  get_manga,
} from '@api';
import {
  BottomSheet,
  Button,
  Dropdown,
  GenericDropdownValues,
  GTextInput,
  MangaList,
} from '@components';
import {
  ColorScheme,
  ISO_LANGS,
  Language,
  PRETENDARD_JP,
  TOP_OVERLAY_HEIGHT,
  systemTeal,
} from '@constants';
import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {RootState, useAppSelector} from '@store';
import {textColor, useAppCore} from '@utils';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import Animated, {LinearTransition, SlideInDown, SlideOutDown} from 'react-native-reanimated';
import {HomeBottomTabsParamsList} from '../HomeNavigator';
const {height, width} = Dimensions.get('window');

type Props = MaterialTopTabScreenProps<HomeBottomTabsParamsList, 'SearchScreen', undefined>;

export function SearchScreen({}: Props) {
  const {colorScheme, preferences} = useAppCore();
  const {tags} = useAppSelector((state: RootState) => state.mangaTags);
  const {allowPornography} = preferences;

  const styles = getStyles(colorScheme);

  const [params, setParams] = useState<get_manga>({
    limit: 10,
    offset: 0,
  });
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [artist, setArtist] = useState<string>('');
  const [authors, setAuthors] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [includedTags, setIncludedTags] = useState<string[]>([]);
  const [publicationDemographic, setPubDemographic] = useState<PublicationDemographic[]>([]);
  const [contentRating, setContentRating] = useState<ContentRating[]>([]);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [mangaStatus, setMangaStatus] = useState<MangaStatus[]>([]);
  const [year, setYear] = useState<string>('');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [resetting, setResetting] = useState(false);

  function retrieveContentRatingDropdownItems(): GenericDropdownValues {
    const dropdownValues = Object.values(CONTENT_RATING)
      .map(rating => {
        return {
          label: rating,
          value: rating,
        };
      })
      .filter(value => {
        return value.value !== CONTENT_RATING.PORNOGRAPHIC;
      });

    if (allowPornography) {
      dropdownValues.push({
        label: CONTENT_RATING.PORNOGRAPHIC,
        value: CONTENT_RATING.PORNOGRAPHIC,
      });
    }

    return dropdownValues;
  }

  function searchIconOnPress() {
    setShowBottomSheet(!showBottomSheet);
    Keyboard.dismiss();
    Vibration.vibrate([0, 50], false);
  }

  function onMangaListScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    Keyboard.dismiss();
    if (!event.nativeEvent.velocity) {
      return;
    }
    if (event.nativeEvent.velocity.y > 1) {
      setShowBottomSheet(false);
    }
  }

  function onPressResetFiltersBtn() {
    setResetting(true);
  }

  function onPressAddAuthorsBtn() {}
  function onPressAddArtistsBtn() {}

  useEffect(() => {
    if (resetting) {
      setArtist('');
      setArtists([]);
      setAuthor('');
      setAuthors([]);
      setIncludedTags([]);
      setTitle('');
      setLanguages([]);
      setMangaStatus([]);
      setPubDemographic([]);
      setYear('');
      setParams({
        limit: 10,
        offset: 1,
        title: '',
      });
      setResetting(false);
      return;
    }

    setParams({
      limit: 10,
      offset: 1,
      title,
      authors,
      artists,
      includedTags,
      publicationDemographic,
      year: parseInt(year, 10),
      availableTranslatedLanguage: languages,
      status: mangaStatus,
      contentRating,
    });
  }, [
    resetting,
    artists,
    authors,
    contentRating,
    includedTags,
    languages,
    mangaStatus,
    publicationDemographic,
    title,
    year,
  ]);

  return (
    <Animated.View style={[styles.container]}>
      <MangaList
        params={params}
        contentViewStyle={styles.mangalistContent}
        onScroll={onMangaListScroll}
      />
      <BottomSheet
        showBottomSheet={showBottomSheet}
        setShowBottomSheet={setShowBottomSheet}
        style={styles.bottomSheet}
        height={height * 0.45}>
        <View style={styles.filterFloatBtns}>
          <Button
            title="Reset Filters"
            containerStyle={styles.resetFiltersBtn}
            onButtonPress={onPressResetFiltersBtn}
            imageReq={require('@assets/icons/refresh.png')}
            btnColor={systemTeal}
            shouldTintImage
          />
        </View>
        <ScrollView contentContainerStyle={styles.bottomSheetScrollView}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterValueLabel}>Title</Text>
            <GTextInput
              placeholder="Title e.g. Saga of Tanya The Evil"
              value={title}
              setValue={setTitle}
            />
          </View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterValueLabel}>Authors (UNDER CONSTRUCTION)</Text>
            <View style={styles.filterInnerGroupRow}>
              <GTextInput
                value={author}
                setValue={setAuthor}
                placeholder="Authors e.g. Kentaro Miura"
                style={styles.filterTextInputsFlex}
                disabled
              />
              <Button
                title="Add Author"
                imageReq={require('@assets/icons/plus.png')}
                onButtonPress={onPressAddAuthorsBtn}
                shouldTintImage
                disabled
              />
            </View>
          </View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterValueLabel}>Artists (UNDER CONSTRUCTION)</Text>
            <View style={styles.filterInnerGroupRow}>
              <GTextInput
                value={artist}
                setValue={setArtist}
                placeholder="Artists e.g. Yusuke Murata"
                style={styles.filterTextInputsFlex}
                disabled
              />
              <Button
                title="Add Artist"
                imageReq={require('@assets/icons/plus.png')}
                onButtonPress={onPressAddArtistsBtn}
                shouldTintImage
                disabled
              />
            </View>
          </View>
          <Animated.View style={styles.filterGroup} layout={LinearTransition}>
            <Text style={styles.filterValueLabel}>Publication Year</Text>
            <GTextInput
              value={year}
              setValue={setYear}
              placeholder="Year e.g. 1960"
              keyboardType="number-pad"
              maxLength={4}
            />
          </Animated.View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterValueLabel}>Tags</Text>
            <Dropdown
              items={
                tags
                  ? tags
                      .map(tag => {
                        return {
                          label: tag.attributes.name.en,
                          subLabel: tag.attributes.group,
                          value: tag.id,
                        };
                      })
                      .filter(tag => tag)
                  : []
              }
              selection={includedTags}
              setSelection={setIncludedTags}
            />
          </View>
          <Animated.View style={styles.filterGroup} layout={LinearTransition}>
            <Text style={styles.filterValueLabel}>Publication Demographic</Text>
            <Dropdown
              items={Object.values(PUBLICATION_DEMOGRAPHIC).map(demographic => {
                return {
                  label: demographic,
                  value: demographic,
                };
              })}
              selection={publicationDemographic}
              setSelection={setPubDemographic}
            />
          </Animated.View>
          <Animated.View style={styles.filterGroup} layout={LinearTransition}>
            <Text style={styles.filterValueLabel}>Publication Status</Text>
            <Dropdown
              items={Object.values(MANGA_STATUS).map(status => {
                return {
                  label: status,
                  value: status,
                };
              })}
              selection={mangaStatus}
              setSelection={setMangaStatus}
            />
          </Animated.View>
          <Animated.View style={styles.filterGroup} layout={LinearTransition}>
            <Text style={styles.filterValueLabel}>Available Translated Languages</Text>
            <Dropdown
              items={Object.keys(ISO_LANGS).map(lang => {
                return {
                  label: ISO_LANGS[lang as keyof typeof ISO_LANGS].name,
                  subLabel: `${ISO_LANGS[lang as keyof typeof ISO_LANGS].nativeName} | ${lang}`,
                  value: lang,
                };
              })}
              selection={languages}
              setSelection={setLanguages}
            />
          </Animated.View>
          <Animated.View style={styles.filterGroup} layout={LinearTransition}>
            <Text style={styles.filterValueLabel}>Content Rating</Text>
            <Dropdown
              items={retrieveContentRatingDropdownItems()}
              selection={contentRating}
              setSelection={setContentRating}
            />
          </Animated.View>
        </ScrollView>
      </BottomSheet>
      <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={[styles.searchContainer]}>
        <TouchableOpacity onPress={searchIconOnPress}>
          <Animated.Image source={require('@assets/icons/magnify.png')} style={styles.searchIcon} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colorScheme.colors.main,
    },
    searchContainer: {
      position: 'absolute',
      right: 15,
      bottom: 15,

      width: width / 7,
      height: width / 7,
      padding: 5,

      backgroundColor: colorScheme.colors.primary,
      borderRadius: 100,

      elevation: 5,
      overflow: 'hidden',

      zIndex: 1000,
    },
    searchIcon: {
      width: '100%',
      height: '100%',
      tintColor: textColor(colorScheme.colors.primary),
    },
    mangalistContent: {
      paddingTop: TOP_OVERLAY_HEIGHT,
    },
    bottomSheet: {
      flex: 1,
    },
    bottomSheetScrollView: {
      flexGrow: 1,
      padding: 15,
      paddingBottom: 80,
    },
    filterValueLabel: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.SEMIBOLD,
      fontSize: 11,
      marginBottom: 5,
    },
    filterGroup: {
      marginBottom: 10,
    },
    filterFloatBtns: {
      position: 'absolute',
      bottom: 20,
      left: 15,
      zIndex: 1000,
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    resetFiltersBtn: {
      marginRight: 10,
      elevation: 10,
    },
    filterInnerGroupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    filterTextInputsFlex: {
      flex: 1,
      marginRight: 10,
    },
  });
}
