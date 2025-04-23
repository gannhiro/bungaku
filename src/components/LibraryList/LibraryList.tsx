import {ColorScheme} from '@constants';
import {RootState, useAppSelector} from '@store';
import React from 'react';
import {ListRenderItemInfo, StyleSheet, Text, View} from 'react-native';
import Animated from 'react-native-reanimated';
import {LibraryListRenderItem} from './LibraryListRenderItem';

export function LibraryList() {
  const {libraryList} = useAppSelector((state: RootState) => state.libraryList);
  const {colorScheme} = useAppSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  function renderItem({item, index}: ListRenderItemInfo<string>) {
    return <LibraryListRenderItem mangaId={item} index={index} />;
  }

  return (
    <View style={styles.container}>
      {libraryList.length > 0 ? (
        <Animated.FlatList
          data={libraryList}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          style={styles.list}
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
