import React, {useRef} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {res_get_manga} from '@api';
import {PRETENDARD_JP} from '@constants';
import LSMangaListRenderItem from './LSMangaListRenderItem';

interface Props {
  mangas: res_get_manga['data'];
  style?: StyleProp<ViewStyle>;
  contentViewStyle?: StyleProp<ViewStyle>;
  onScroll?:
    | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
    | undefined;
}

export function LibraryMangaList({
  mangas,
  style,
  contentViewStyle,
  onScroll,
}: Props) {
  const flatlistRef = useRef<FlatList>(null);

  function renderItem({
    item,
    index,
  }: ListRenderItemInfo<res_get_manga['data'][0]>) {
    return (
      <LSMangaListRenderItem item={item} index={index} size={mangas.length} />
    );
  }

  if (!mangas || (mangas as res_get_manga['data']).length > 0) {
    return (
      <View style={[styles.container, style]}>
        <FlatList
          data={mangas}
          renderItem={renderItem}
          style={styles.container}
          contentContainerStyle={[
            styles.flatlistContainerStyle,
            contentViewStyle,
          ]}
          keyExtractor={(_item, index) => _item.id + ' - ' + index.toString()}
          ref={flatlistRef}
          onEndReachedThreshold={0.1}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
        />
      </View>
    );
  }

  return (
    <View style={styles.emptyView}>
      <Text style={styles.noMangasLabel}>
        Ain't nobody here but us chickens!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  emptyView: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMangasLabel: {
    fontFamily: PRETENDARD_JP.REGULAR,
  },
  flatlistContainerStyle: {
    padding: 10,
  },
});
