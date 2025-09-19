import {ColorScheme} from '@constants';
import React, {useEffect, useState} from 'react';
import {ListRenderItemInfo, StyleSheet, Text, View} from 'react-native';
import Animated from 'react-native-reanimated';
import {LibraryListRenderItem} from './LibraryListRenderItem';
import {useAppCore} from '@utils';
import {Manga} from '@db';
import {RootState, useAppSelector} from '@store';

export function LibraryList() {
  const {libraryList} = useAppSelector((state: RootState) => state.libraryList);
  const {colorScheme} = useAppCore();

  const styles = getStyles(colorScheme);

  const [mangas, setMangas] = useState<Manga[]>([]);

  function renderItem({item}: ListRenderItemInfo<Manga>) {
    return <LibraryListRenderItem manga={item} />;
  }

  useEffect(() => {
    (async () => {
      const mangas = await Manga.getMangaBulk(libraryList);
      setMangas(mangas);
    })();
  }, [libraryList]);

  return (
    <View style={styles.container}>
      {mangas.length > 0 ? (
        <Animated.FlatList
          data={mangas}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          keyExtractor={item => item._raw.id}
        />
      ) : (
        <Text>No mangas in your library!</Text>
      )}
    </View>
  );
}

function getStyles(_colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    list: {
      marginTop: 20,
    },
    listContent: {
      marginLeft: 10,
    },
  });
}
