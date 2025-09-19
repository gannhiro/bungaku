import {ColorScheme, PRETENDARD_JP} from '@constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootState, setLibraryUpdatesOnLaunch, useAppSelector} from '@store';
import {UpdatedMangaNotifications} from '@types';
import {textColor, useAppCore} from '@utils';
import React, {useEffect} from 'react';
import {Dimensions, FlatList, ListRenderItemInfo, StyleSheet, Text, View} from 'react-native';
import {LibraryListRenderItem} from '../LibraryList/LibraryListRenderItem';

const {width} = Dimensions.get('window');

export function LibraryUpdates() {
  const {dispatch, colorScheme, navigation} = useAppCore<'HomeNavigator'>();
  const {updatedMangaList} = useAppSelector((state: RootState) => state.libraryUpdates);
  const styles = getStyles(colorScheme);

  function renderItem({item, index}: ListRenderItemInfo<UpdatedMangaNotifications>) {
    return <LibraryListRenderItem mangaId={item.mangaId} index={index} />;
  }

  useEffect(() => {
    navigation.addListener('focus', async () => {
      const tempLibraryUpdates: UpdatedMangaNotifications[] = JSON.parse(
        (await AsyncStorage.getItem('library-updates')) ?? '[]',
      );
      dispatch(setLibraryUpdatesOnLaunch(tempLibraryUpdates));
    });
  }, [dispatch, navigation]);

  if (updatedMangaList.length === 0) {
    return;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Library Updates</Text>
      <FlatList
        data={updatedMangaList}
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
