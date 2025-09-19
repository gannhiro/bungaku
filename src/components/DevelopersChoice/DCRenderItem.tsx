import {res_get_cover_$, res_get_manga} from '@api';
import {ColorScheme, DEVS_CHOICE, OTOMANOPEE, PRETENDARD_JP} from '@constants';
import {textColor, useAppCore} from '@utils';
import React from 'react';
import {Dimensions, Image, StyleSheet, Text, View, ViewStyle} from 'react-native';
import Animated from 'react-native-reanimated';

const {height, width} = Dimensions.get('window');

type Props = {
  manga: res_get_manga['data'][0];
  index: number;
};

export function DCRenderItem({manga, index}: Props) {
  const {colorScheme, preferences} = useAppCore();
  const {language} = preferences;

  const styles = getStyles(colorScheme);
  const marginStyles: ViewStyle = {
    marginLeft: index === 0 ? 15 : 0,
  };

  const coverItem = manga.relationships.find(rs => rs.type === 'cover_art') as
    | res_get_cover_$['data']
    | undefined;
  const coverSrc = `https://uploads.mangadex.org/covers/${manga.id}/${coverItem?.attributes.fileName}`;

  const title =
    manga.attributes.title?.[language] ??
    manga.attributes.altTitles?.find(altTitle => altTitle[language])?.[language] ??
    Object.values(manga?.attributes.title ?? {})[0] ??
    manga.attributes.title?.en;

  const description = manga.attributes.description?.[language] ?? manga.attributes.description?.en;

  return (
    <Animated.View style={[styles.container, marginStyles]}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        style={{
          flex: 1,
          width: '100%',
        }}>
        <Image source={{uri: coverSrc}} style={styles.cover} />
        <View style={{marginHorizontal: 5, marginVertical: 10}}>
          <Text style={styles.titleLabel}>{title}</Text>
          <Text style={styles.desc}>{description}</Text>
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      width: (width - 15) / 2 - 15,
      height: height * 0.2,
      marginRight: 15,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',

      borderColor: colorScheme.colors.primary,
      borderWidth: 2,
    },
    cover: {
      width: (width - 15) / 2 - 15,
      height: height * 0.3,
    },
    titleLabel: {
      fontFamily: OTOMANOPEE,
      color: textColor(colorScheme.colors.main),
      fontSize: 18,
    },
    desc: {
      fontFamily: PRETENDARD_JP.REGULAR,
      color: textColor(colorScheme.colors.main),
      fontSize: 14,
    },
  });
}
