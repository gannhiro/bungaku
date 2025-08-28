import {ColorScheme} from '@constants';
import React from 'react';
import {ListRenderItemInfo, StyleSheet, Text, View} from 'react-native';
import withObservables from '@nozbe/with-observables';
import Animated from 'react-native-reanimated';
import {LibraryListRenderItem} from './LibraryListRenderItem';
import {useAppCore} from '@utils';
import {database, Manga} from '@db';
import {Q} from '@nozbe/watermelondb';

type Props = {
  mangas: Manga[];
};

export function LibraryList({mangas}: Props) {
  const {colorScheme} = useAppCore();

  const styles = getStyles(colorScheme);

  function renderItem({item}: ListRenderItemInfo<Manga>) {
    return <LibraryListRenderItem manga={item} />;
  }

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

const enhance = withObservables([], () => ({
  mangas: database.collections
    .get<Manga>('mangas')
    .query(Q.where('stay_updated', Q.notEq(null)))
    .observe(),
}));

export const EnhancedLibraryList = enhance(LibraryList);

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
