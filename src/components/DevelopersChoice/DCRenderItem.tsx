import {res_get_cover_$, res_get_manga} from '@api';
import {ColorScheme, DEVS_CHOICE, OTOMANOPEE, PRETENDARD_JP} from '@constants';
import {RootState} from '@store';
import {textColor} from '@utils';
import React from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
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
      <View style={{flex: 1, marginRight: 15}}>
        <Text style={styles.titleLabel}>
          {manga?.attributes.title.en ?? 'no title'}
        </Text>
      </View>
      <FastImage source={{uri: coverSrc}} style={styles.cover} />
      <LinearGradient
        start={{x: 1, y: 0}}
        end={{x: -1, y: 0}}
        colors={['#0000', colorScheme.colors.main, colorScheme.colors.main]}
        style={styles.imageGradient}
      />
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      width: width,
      height: height * 0.3,
      paddingHorizontal: 15,
      flexDirection: 'row',
    },
    cover: {
      height: height * 0.3,
      width: '40%',
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
    },
    imageGradient: {
      height: height * 0.3,
      width: 100,
      position: 'absolute',
      bottom: 0,
      left: '61%',
    },
    rightGroup: {
      flex: 1,
      paddingLeft: 10,
    },
    titleLabel: {
      fontFamily: OTOMANOPEE,
      color: textColor(colorScheme.colors.main),
      fontSize: 18,
    },
    description: {
      fontFamily: PRETENDARD_JP.LIGHT,
      color: textColor(colorScheme.colors.main),
      textAlign: 'justify',
    },
  });
}
