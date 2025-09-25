import {ColorScheme} from '@constants';
import {textColor, useAppCore} from '@utils';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {Dimensions, Image, StyleSheet, Text, View, Platform, FlatList} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {ReadingMode} from './ReadChapterScreen';
import {useReadChapterScreenContext} from './useReadChapterScreenContext';
import FS from 'react-native-fs';
import {Button} from '@components';

type Props = {
  path: string;
  readingMode: ReadingMode;
  pagePromise?: Promise<FS.DownloadResult>;
};

const {width, height} = Dimensions.get('screen');

export const RCSChapterImages = memo(({pagePromise, path}: Props) => {
  const {locReadingMode} = useReadChapterScreenContext();
  const {colorScheme} = useAppCore();

  const styles = getStyles(colorScheme);

  const [isZoomed, setIsZoomed] = useState(false);
  const [imHeight, setImHeight] = useState<number | null>(null);
  const [isError, setIsError] = useState(false);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const gesturesAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {scale: scale.value},
      {translateX: translateX.value},
      {translateY: translateY.value},
    ],
  }));

  const updateZoomState = useCallback((zoomed: boolean) => setIsZoomed(zoomed), []);

  function resetZoom() {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) return resetZoom();

      scale.value = withTiming(2);
      savedScale.value = 2;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      const newScale = savedScale.value * e.scale;
      scale.value = Math.max(1, newScale);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1) resetZoom();
    });

  const panGesture = Gesture.Pan()
    .enabled(isZoomed)
    .onStart(() => {})
    .onUpdate(e => {
      translateX.value = savedTranslateX.value + e.translationX / scale.value;
      translateY.value = savedTranslateY.value + e.translationY / scale.value;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const gestures = Gesture.Simultaneous(pinchGesture, panGesture, doubleTap);

  useDerivedValue(() => {
    'worklet';
    const currentlyZoomed = scale.value > 1;
    runOnJS(updateZoomState)(currentlyZoomed);
  }, []);

  useEffect(() => {
    (async () => {
      if (pagePromise) {
        try {
          const {statusCode} = await pagePromise;

          if (statusCode === 200) {
            Image.getSize(path, (iWidth, iHeight) => {
              const ratio = iWidth / iHeight;
              const finalHeight = Math.round(width / ratio);
              setImHeight(finalHeight);
            });
          } else {
            throw `An error has occured: ${statusCode}`;
          }
        } catch (e) {
          console.log('FAILED!: ' + e);
          setIsError(true);
        }

        return;
      }

      Image.getSize(path, (iWidth, iHeight) => {
        const ratio = iWidth / iHeight;
        const finalHeight = Math.round(width / ratio);
        setImHeight(finalHeight);
      });
    })();
  }, [pagePromise, path]);

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text>an error has occured!</Text>
        <Button title="Retry" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {height: locReadingMode === 'webtoon' ? imHeight ?? undefined : height},
      ]}>
      {imHeight ? (
        <GestureDetector gesture={gestures}>
          <Animated.View style={[{flex: 1}, gesturesAnimatedStyle]}>
            <FastImage
              source={{uri: path, priority: 'high'}}
              resizeMode="contain"
              style={{width: width, height: '100%'}}
            />
          </Animated.View>
        </GestureDetector>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingLabel}>loading page...</Text>
        </View>
      )}
    </View>
  );
});

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      height: height * 0.3,
      width: width,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingContainer: {
      height: height,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingLabel: {
      color: textColor(colorScheme.colors.main),
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
