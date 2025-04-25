import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {MCSBottomTabsParamsList} from '../MangaChaptersScreen';
import {
  ColorScheme,
  ISO_LANGS,
  Language,
  OTOMANOPEE,
  PRETENDARD_JP,
  TOP_OVERLAY_HEIGHT,
  systemPurple,
  systemYellow,
} from '@constants';
import {RootState, useAppSelector} from '@store';
import {numberShorten, textColor} from '@utils';
import {FlagIcon} from '@components';
import {useMangaChaptersScreenContext} from '../useMangaChaptersScreenContext';

type Props = MaterialTopTabScreenProps<
  MCSBottomTabsParamsList,
  'MCSDetailsTab'
>;

const {width} = Dimensions.get('screen');

export function MCSDetailsTab({}: Props) {
  const {colorScheme} = useAppSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);
  const {manga, statistics, loading} = useMangaChaptersScreenContext();

  return (
    <View style={styles.container}>
      {!loading && (
        <ScrollView>
          <Text style={styles.label}>Statistics</Text>
          <View style={styles.groupRow}>
            <Text style={styles.statLabel}>
              {numberShorten(
                statistics?.statistics[manga?.id ?? ''].follows ?? 0,
              )}{' '}
              Follows
            </Text>
            <Image
              source={require('@assets/icons/book.png')}
              style={styles.bookIcon}
            />
            <Text style={styles.statLabel}>
              {statistics?.statistics[manga?.id ?? ''].rating.bayesian.toFixed(
                2,
              )}{' '}
            </Text>
            <Image
              source={require('@assets/icons/star.png')}
              style={styles.starIcon}
            />
          </View>
          <Text style={styles.label}>Descriptions</Text>
          <View style={styles.titlesGroup}>
            {Object.keys(manga?.attributes.description ?? {}).map(lang => {
              return (
                <TouchableOpacity style={styles.titleChip} key={lang}>
                  <FlagIcon language={lang as Language} style={styles.flag} />
                  <Text style={styles.titleChipLabel}>
                    {ISO_LANGS[lang as Language].name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.label}>Alternate Titles</Text>
          {/* <View style={styles.titlesGroup}>
            {manga.attributes.altTitles.map(lang => {
              const key = Object.keys(lang)[0];
              return (
                <View style={styles.titleChip}>
                  <FlagIcon language={key as Language} style={styles.flag} />
                  <Text style={styles.titleChipLabel}>{`${lang[key]}`}</Text>
                </View>
              );
            })}
          </View> */}
        </ScrollView>
      )}
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: TOP_OVERLAY_HEIGHT + 5,
      width,
    },
    descLabel: {
      fontSize: 18,
      color: textColor(colorScheme.colors.main),
      fontFamily: OTOMANOPEE,
    },
    desc: {
      fontSize: 12,
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
    },
    statLabel: {
      fontSize: 16,
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
    },
    label: {
      fontSize: 18,
      color: textColor(colorScheme.colors.main),
      fontFamily: OTOMANOPEE,
      paddingHorizontal: 20,
    },
    descGroup: {
      width,
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    groupRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 10,
      alignItems: 'center',
    },
    titlesGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginVertical: 5,
      paddingHorizontal: 20,
    },
    titleChip: {
      marginRight: 5,
      marginBottom: 5,
      padding: 8,
      borderRadius: 6,
      backgroundColor: colorScheme.colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleChipLabel: {
      fontSize: 14,
      color: textColor(colorScheme.colors.primary),
      fontFamily: PRETENDARD_JP.REGULAR,
      alignItems: 'center',
    },
    flag: {
      width: 20,
      height: 15,
      marginRight: 5,
    },
    bookIcon: {
      width: 20,
      height: 20,
      tintColor: systemPurple,
      marginRight: 10,
    },
    starIcon: {
      width: 20,
      height: 20,
      tintColor: systemYellow,
    },
  });
}
