import {ColorScheme, PRETENDARD_JP} from '@constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {RootState, setLibraryUpdates} from '@store';
import {UpdatedMangaData} from '@types';
import {textColor} from '@utils';
import React, {useEffect} from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {LibraryListRenderItem} from '../LibraryList/LibraryListRenderItem';

const {width} = Dimensions.get('window');

export function LibraryUpdates() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {updatedMangaList} = useSelector(
    (state: RootState) => state.libraryUpdates,
  );
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  function renderItem({item, index}: ListRenderItemInfo<UpdatedMangaData>) {
    return <LibraryListRenderItem mangaId={item.mangaId} index={index} />;
  }

  useEffect(() => {
    navigation.addListener('focus', async () => {
      const tempLibraryUpdates: UpdatedMangaData[] = JSON.parse(
        (await AsyncStorage.getItem('library-updates')) ?? '[]',
      );
      dispatch(setLibraryUpdates(tempLibraryUpdates));
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
