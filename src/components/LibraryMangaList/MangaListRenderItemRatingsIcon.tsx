import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {res_get_statistics_manga} from '../../api/types';
import {systemYellow, white} from '@constants';

type Props = {
  statistics?: res_get_statistics_manga['statistics'];
  mangaId: string;
};

export function MangaListRenderItemRatingsIcon({statistics, mangaId}: Props) {
  return (
    <View style={styles.statsContainer}>
      <Image
        source={require('../../../assets/icons/star.png')}
        style={[styles.icon]}
      />
      <Text style={styles.numbers}>
        {typeof statistics?.[mangaId] !== 'undefined' &&
          statistics[mangaId].rating.bayesian.toPrecision(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 15,
    height: 15,
    tintColor: systemYellow,
  },
  numbers: {
    fontFamily: 'PretendardJP-Regular',
    color: white,
    fontSize: 10,
  },
});
