import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import React, {useCallback, useState} from 'react';
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
import {numberShorten, textColor, useAppCore} from '@utils';
import {Button, FlagIcon} from '@components';
import {useMangaChaptersScreenContext} from '../useMangaChaptersScreenContext';
import InAppBrowser from 'react-native-inappbrowser-reborn';

type Props = MaterialTopTabScreenProps<MCSBottomTabsParamsList, 'MCSDetailsTab'>;

const {width} = Dimensions.get('screen');

export function MCSDetailsTab({}: Props) {
  const {colorScheme, preferences} = useAppCore();
  const {language} = preferences;

  const styles = getStyles(colorScheme);
  const {manga, statistics, loading} = useMangaChaptersScreenContext();

  const [selectedDescLanguage, setSelectedDescLanguage] = useState<Language>(language);

  const onPressLanguageChip = useCallback(
    (lang: Language) => () => {
      setSelectedDescLanguage(lang);
    },
    [selectedDescLanguage],
  );

  const onPressReadComments = useCallback(() => {
    const url = `https://forums.mangadex.org/threads/${statistics?.commentsThreadId}/`;
    InAppBrowser.open(url);
  }, [statistics]);

  return (
    <View style={styles.container}>
      {!loading && (
        <ScrollView>
          <Text style={styles.label}>Statistics</Text>
          <View style={styles.groupRow}>
            <Text style={styles.statLabel}>{numberShorten(statistics?.follows ?? 0)} Follows</Text>
            <Image source={require('@assets/icons/book.png')} style={styles.bookIcon} />
            <Text style={styles.statLabel}>{statistics?.ratingBayesian?.toFixed(2)} </Text>
            <Image source={require('@assets/icons/star.png')} style={styles.starIcon} />
            <Button title="read comments" onButtonPress={onPressReadComments} />
          </View>
          <Text style={styles.label}>Descriptions</Text>
          <View style={styles.titlesGroup}>
            {Object.keys(manga?.description ?? {}).map(lang => {
              return (
                <TouchableOpacity
                  style={[
                    styles.titleChip,
                    lang === selectedDescLanguage && styles.titleChipActive,
                  ]}
                  key={lang}
                  onPress={onPressLanguageChip(lang as Language)}>
                  <FlagIcon language={lang as Language} style={styles.flag} />
                  <Text style={styles.titleChipLabel}>{ISO_LANGS[lang as Language].name}</Text>
                </TouchableOpacity>
              );
            })}

            <Text style={styles.description}>{manga?.description?.[selectedDescLanguage]}</Text>
          </View>
          <Text style={styles.label}>Alternate Titles</Text>
          <View style={styles.titlesGroup}>
            {manga?.altTitles.map(title => (
              <Text style={styles.altTitle}>{Object.values(title)[0]}</Text>
            ))}
          </View>
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
      backgroundColor: colorScheme.colors.secondary,
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleChipActive: {
      backgroundColor: colorScheme.colors.primary,
    },
    titleChipLabel: {
      fontSize: 14,
      color: textColor(colorScheme.colors.primary),
      fontFamily: PRETENDARD_JP.REGULAR,
      alignItems: 'center',
    },
    description: {
      fontSize: 14,
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
      textAlign: 'justify',
    },
    altTitle: {
      fontSize: 14,
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
      textAlign: 'justify',
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
