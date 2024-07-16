import {ColorScheme, PRETENDARD_JP} from '@constants';
import {RootState} from '@store';
import {UpdatedMangaData} from '@types';
import {textColor} from '@utils';
import React from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import {LibraryListRenderItem} from '../LibraryList/LibraryListRenderItem';

const {width} = Dimensions.get('window');

export function LibraryUpdates() {
  const libraryUpdates = useSelector(
    (state: RootState) => state.libraryUpdates,
  );
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  function renderItem({item, index}: ListRenderItemInfo<UpdatedMangaData>) {
    return <LibraryListRenderItem mangaId={item.mangaId} index={index} />;
  }

  if (libraryUpdates.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Library Updates</Text>
      <FlatList
        data={libraryUpdates}
        renderItem={renderItem}
        contentContainerStyle={styles.listCont}
        horizontal
      />
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      alignItems: 'stretch',
      justifyContent: 'center',
      height: width / 3 + 20,
      marginBottom: 30,
    },
    listCont: {
      paddingHorizontal: 15,
    },
    noUpdatesLabel: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.MEDIUM,
      fontSize: 14,
    },
    header: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 12,
      marginLeft: 15,
    },
  });
}
