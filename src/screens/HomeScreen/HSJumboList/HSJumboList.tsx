import {get_manga, mangadexAPI, res_get_manga} from '@api';
import {APP_NAME, ColorScheme, PRETENDARD_JP, TOP_OVERLAY_HEIGHT} from '@constants';
import {textColor, useAppCore} from '@utils';
import React, {Fragment, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Progress from 'react-native-progress';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {HSJumboListPageIndicator} from './HSJumboListPageIndicator';
import {HSJumboListRenderItem} from './HSJumboListRenderItem';
import {Manga} from '@db';

const {width} = Dimensions.get('window');
export type CoverSources = {
  [key: number]: string;
};

export function HSJumboList() {
  const {colorScheme, intError} = useAppCore();

  const styles = getStyles(colorScheme);

  const listRef = useRef<FlatList>(null);
  const [mangas, setMangas] = useState<res_get_manga['data']>();
  const [currentPage, setCurrentPage] = useState(0);
  const [currCoverSrc, setCurrCoverSrc] = useState<string>();
  const [loading, setLoading] = useState(true);

  const bgHeight = useSharedValue(0);
  const bgContOpacity = useSharedValue(1);
  const bgContStyle = useAnimatedStyle(() => {
    return {
      opacity: bgContOpacity.value,
      height: bgHeight.value,
    };
  });

  function renderItem({item, index}: ListRenderItemInfo<res_get_manga['data'][0]>) {
    return (
      <HSJumboListRenderItem
        manga={item}
        index={index}
        currentPage={currentPage}
        setCurrCoverSrc={setCurrCoverSrc}
      />
    );
  }

  function onScrollJumboList(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetX = event.nativeEvent.contentOffset.x;
    const tempPage = Math.round(offsetX / width);
    if (tempPage !== currentPage) {
      setCurrentPage(tempPage);
    }
  }

  function getItemLayout(_: Array<any>, index: number) {
    return {
      length: width,
      offset: 0,
      index,
    };
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      const mangaData = await mangadexAPI<res_get_manga, get_manga>(
        'get',
        '/manga',
        {limit: 15, offset: 1, includes: ['author', 'cover_art']},
        [],
      );
      if (mangaData && mangaData.result === 'ok') {
        await Manga.upsertFromApiBulk(mangaData.data);
        setMangas(mangaData?.data);
        setLoading(false);
      }
    })();
  }, [intError]);

  useEffect(() => {
    const timeout = setInterval(() => {
      if (currentPage < 14) {
        listRef.current?.scrollToOffset({offset: width * (currentPage + 1)});
      } else {
        listRef.current?.scrollToIndex({index: 0});
      }
    }, 10000);

    return () => clearInterval(timeout);
  }, [currentPage, mangas]);

  return (
    <View
      style={styles.container}
      onLayout={e => {
        bgHeight.value = e.nativeEvent.layout.height;
      }}>
      <Text style={styles.headerTitle}>{APP_NAME}</Text>
      {!loading && !intError ? (
        <Fragment>
          <FlatList
            horizontal
            ref={listRef}
            data={mangas ?? []}
            renderItem={renderItem}
            snapToInterval={width}
            showsHorizontalScrollIndicator={false}
            onScroll={onScrollJumboList}
            style={styles.list}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={11}
            removeClippedSubviews={false}
            getItemLayout={getItemLayout}
            keyExtractor={(item, index) => `${item.id}-${index}`}
          />
          <Animated.View style={[styles.bgCont, bgContStyle]}>
            <Animated.Image
              source={{uri: currCoverSrc + '.512.jpg'}}
              style={[styles.bgImage]}
              key={'cover: ' + currCoverSrc}
            />
            <LinearGradient colors={['#0000', colorScheme.colors.main]} style={[styles.gradient]} />
          </Animated.View>

          <HSJumboListPageIndicator currentPage={currentPage} />
        </Fragment>
      ) : (
        <View style={styles.spinnerContainer}>
          {intError ? (
            <Text>No Internet!</Text>
          ) : (
            <Progress.CircleSnail style={styles.spinner} color={colorScheme.colors.secondary} />
          )}
        </View>
      )}
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      marginBottom: 10,
    },
    headerTitle: {
      textAlign: 'center',
      fontFamily: PRETENDARD_JP.MEDIUM,
      color: textColor(colorScheme.colors.main),
      fontSize: 11,
      marginVertical: 20,
      marginTop: TOP_OVERLAY_HEIGHT,
      zIndex: 10,
    },
    list: {
      zIndex: 10,
    },
    bgCont: {
      opacity: 0.3,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    bgImage: {
      height: (width / 4) * 2.3 + 67,
      width: width,
      opacity: colorScheme.type === 'dark' ? 0.5 : 0.3,
    },
    gradient: {
      height: (width / 4) * 2.3 + 67,
      width: width,
      flex: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    },
    spinnerContainer: {
      height: (width / 4) * 2.3 + 37,
      alignItems: 'center',
      justifyContent: 'center',
    },
    spinner: {},
  });
}
