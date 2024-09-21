import {get_manga, mangadexAPI, res_get_manga} from '@api';
import {ColorScheme, DEVS_CHOICE, PRETENDARD_JP} from '@constants';
import {RootState} from '@store';
import {textColor} from '@utils';
import {useEffect, useState} from 'react';
import React, {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {DCRenderItem} from './DCRenderItem';

const {width, height} = Dimensions.get('screen');

type Props = {};

export function DevelopersChoice({}: Props) {
  const dispatch = useDispatch();
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);
  const [mangas, setMangas] = useState<res_get_manga['data']>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  function renderItem({
    item,
    index,
  }: ListRenderItemInfo<res_get_manga['data'][0]>) {
    return <DCRenderItem manga={item} index={index} />;
  }

  useEffect(() => {
    (async () => {
      const data = await mangadexAPI<res_get_manga, get_manga>(
        'get',
        '/manga',
        {
          limit: Object.keys(DEVS_CHOICE).length,
          offset: 0,
          ids: Object.keys(DEVS_CHOICE),
          includes: ['artist', 'author', 'cover_art'],
        },
        [],
      );
      if (data?.result === 'ok') {
        setMangas(data.data);
      }
      if (data?.result === 'error') {
        setError(true);
        return;
      }

      setLoading(false);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Developer's Choice</Text>
      <FlatList
        data={mangas}
        renderItem={renderItem}
        contentContainerStyle={styles.listCont}
        showsHorizontalScrollIndicator={false}
        initialNumToRender={Object.keys(DEVS_CHOICE).length}
        horizontal
      />
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      marginBottom: 50,
    },
    header: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.SEMIBOLD,
      fontSize: 12,
      marginLeft: 15,
      marginBottom: 5,
    },
    listCont: {},
  });
}
