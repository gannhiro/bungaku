import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {res_get_statistics_manga} from '@api';
import {systemPurple, white} from '@constants';
import {numberShorten} from '@utils';

type Props = {
  statistics?: res_get_statistics_manga['statistics'];
  mangaId: string;
};

export function MangaListRenderItemFollowsIcon({statistics, mangaId}: Props) {
  return (
    <View style={styles.statsContainer}>
      <Image
        source={require('../../../assets/icons/book.png')}
        style={[styles.icon]}
      />
      <Text style={styles.numbers}>
        {typeof statistics?.[mangaId] !== 'undefined' &&
          numberShorten(statistics[mangaId].follows)}
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
    tintColor: systemPurple,
  },
  numbers: {
    fontFamily: 'PretendardJP-Regular',
    color: white,
    fontSize: 10,
  },
});
