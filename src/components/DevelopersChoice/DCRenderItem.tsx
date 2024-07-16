import {res_get_cover_$, res_get_manga} from '@api';
import {ColorScheme, DEVS_CHOICE, OTOMANOPEE, PRETENDARD_JP} from '@constants';
import {RootState} from '@store';
import {textColor} from '@utils';
import React from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useDispatch, useSelector} from 'react-redux';

const {height, width} = Dimensions.get('window');

type Props = {
  manga: res_get_manga['data'][0];
};

export function DCRenderItem({manga}: Props) {
  const dispatch = useDispatch();
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  const coverItem = manga.relationships.find(rs => rs.type === 'cover_art') as
    | res_get_cover_$['data']
    | undefined;
  const coverSrc = `https://uploads.mangadex.org/covers/${manga.id}/${coverItem?.attributes.fileName}`;

  return (
    <View style={styles.container}>
      <FastImage source={{uri: coverSrc}} style={styles.cover} />
      <Text style={styles.titleLabel}>
        {manga?.attributes.title.en ?? 'no title'}
      </Text>
      <Text style={styles.description}>
        {DEVS_CHOICE[manga.id as keyof typeof DEVS_CHOICE]}
      </Text>
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      height: height * 0.3,
      width: width,
      paddingHorizontal: 15,
    },
    cover: {
      height: height * 0.3,
      width: width - 30,
      position: 'absolute',
      top: 0,
      left: 15,
      borderRadius: 20,
      opacity: 0.2,
    },
    rightGroup: {
      flex: 1,
      paddingLeft: 10,
    },
    titleLabel: {
      fontFamily: OTOMANOPEE,
      color: textColor(colorScheme.colors.main),
      fontSize: 18,
      marginHorizontal: 15,
      marginTop: 15,
    },
    description: {
      fontFamily: PRETENDARD_JP.LIGHT,
      color: textColor(colorScheme.colors.main),
      textAlign: 'justify',
      marginHorizontal: 15,
    },
  });
}
