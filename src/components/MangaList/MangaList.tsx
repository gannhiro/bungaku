import React, {Fragment, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {MangaListRenderItem} from './MangaListRenderItem';
import {mangadexAPI, get_manga, res_get_manga} from '@api';
import {MangaListFooter} from './MangaListFooter';
import {ColorScheme, PRETENDARD_JP} from '@constants';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, setError} from '@store';
import {textColor, useInternetConn} from '@utils';
import * as Progress from 'react-native-progress';

const {width} = Dimensions.get('screen');

interface Props {
  limit: number;
  includedTags?: string[];
  horizontal?: boolean;
  title?: string;
  style?: StyleProp<ViewStyle>;
  contentViewStyle?: StyleProp<ViewStyle>;
  onScroll?:
    | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
    | undefined;
}

export function MangaList({
  limit,
  title,
  includedTags,
  horizontal,
  style,
  contentViewStyle,
  onScroll,
}: Props) {
  const intError = useInternetConn();
  const dispatch = useDispatch();
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );

  const styles = getStyles(colorScheme);

  const [mangas, setMangas] = useState<res_get_manga['data']>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const flatlistRef = useRef<FlatList>(null);

  function renderItem({
    item,
    index,
  }: ListRenderItemInfo<res_get_manga['data'][0]>) {
    return (
      <MangaListRenderItem
        key={item.id + index}
        manga={item}
        index={index}
        size={mangas.length}
      />
    );
  }

  async function onEndReached() {
    if (total <= offset + limit || intError) {
      return;
    }
    const data = await mangadexAPI<res_get_manga, get_manga>(
      'get',
      '/manga',
      {
        limit,
        offset: offset + limit,
        includedTags,
        title,
        includes: ['artist', 'author', 'cover_art'],
      },
      [],
    );

    if (data && data.result === 'ok') {
      const tempMangas = [...mangas, ...data.data];
      setOffset(offset + limit);
      setMangas(tempMangas);
    } else if (data && data.result === 'error') {
      dispatch(setError(data));
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    setLoadError(false);
    const data = await mangadexAPI<res_get_manga, get_manga>(
      'get',
      '/manga',
      {
        limit,
        offset: 1,
        includedTags,
        title,
        includes: ['artist', 'author', 'cover_art'],
      },
      [],
    );

    if (data && data.result === 'ok') {
      setMangas(data?.data);
      setTotal(data.total);
      flatlistRef.current?.scrollToOffset({animated: true, offset: 0});
      setLoading(false);
    } else if (data && data.result === 'error') {
      setLoadError(true);
      dispatch(setError(data));
    }
    setRefreshing(false);
  }

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    (async () => {
      const data = await mangadexAPI<res_get_manga, get_manga>(
        'get',
        '/manga',
        {
          limit,
          offset: 1,
          includedTags,
          contentRating: [],
          title,
          includes: ['artist', 'author', 'cover_art'],
        },
        [],
      );

      if (data && data.result === 'ok') {
        setMangas(data?.data);
        setTotal(data.total);
        flatlistRef.current?.scrollToOffset({animated: true, offset: 0});
      } else if (data && data.result === 'error') {
        setLoadError(true);
        dispatch(setError(data));
      }
      setLoading(false);
    })();
  }, [dispatch, includedTags, limit, title, intError]);

  return (
    <View style={[styles.container, style]}>
      {(!loading && !intError) || mangas.length > 0 ? (
        <FlatList
          data={mangas}
          renderItem={renderItem}
          horizontal={horizontal}
          style={styles.container}
          contentContainerStyle={[
            styles.flatlistContainerStyle,
            contentViewStyle,
          ]}
          keyExtractor={(_item, index) => _item.id + ' - ' + index.toString()}
          onEndReached={onEndReached}
          ref={flatlistRef}
          ListFooterComponent={
            !(total <= offset + limit) ? <MangaListFooter /> : undefined
          }
          onEndReachedThreshold={0.1}
          numColumns={horizontal ? 0 : 2}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              progressViewOffset={100}
            />
          }
          getItemLayout={(_, index) => {
            return {
              length: (width / 3) * 2 + 10,
              index: index,
              offset: ((width / 3) * 2 + 10) * index,
            };
          }}
          initialNumToRender={8}
          windowSize={13}
          maxToRenderPerBatch={6}
        />
      ) : (
        <View style={styles.emptyView}>
          {!loadError ? (
            intError ? (
              <Text style={styles.noInternetLabel}>No Internet!</Text>
            ) : (
              <Progress.CircleSnail
                size={width / 4}
                color={textColor(colorScheme.colors.main)}
              />
            )
          ) : (
            <Fragment>
              <Text style={styles.noInternetLabel}>Error Loading Manga!</Text>
              <Text style={styles.noInternetLabel}>Please Refresh!</Text>
            </Fragment>
          )}
        </View>
      )}
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
    },
    overlay: {
      flex: 1,
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    emptyView: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    noInternetLabel: {
      fontFamily: PRETENDARD_JP.BOLD,
      color: textColor(colorScheme.colors.main),
    },
    flatlistContainerStyle: {
      padding: 10,
    },
  });
}
