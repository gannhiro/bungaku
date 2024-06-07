import {ColorScheme} from '@constants';
import {RootStackParamsList} from '@navigation';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootState} from '@store';
import React from 'react';
import {ListRenderItemInfo, StyleSheet, Text, View} from 'react-native';
import FS from 'react-native-fs';
import Animated from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';
import {LibraryListRenderItem} from './LibraryListRenderItem';

export function LibraryList() {
  const dispatch = useDispatch();
  const {libraryList} = useSelector((state: RootState) => state.libraryList);
  const navigation =
    useNavigation<
      StackNavigationProp<RootStackParamsList, 'HomeScreen', undefined>
    >();
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  function renderItem({item, index}: ListRenderItemInfo<string>) {
    const coverPath = `file://${FS.DocumentDirectoryPath}/manga/${item}/cover.png`;
    return (
      <LibraryListRenderItem
        mangaId={item}
        coverPath={coverPath}
        index={index}
      />
    );
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
