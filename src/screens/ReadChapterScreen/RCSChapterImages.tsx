import {ColorScheme} from '@constants';
import {textColor} from '@utils';
import React, {memo, useEffect, useState} from 'react';
import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';
import FastImage, {FastImageProps} from 'react-native-fast-image';
import {Gesture} from 'react-native-gesture-handler';
import {useSharedValue, withTiming} from 'react-native-reanimated';
import {useSelector} from 'react-redux';
import {RootState} from '../../store/store';
import {READING_MODES, ReadingMode} from './ReadChapterScreen';
import {useReadChapterScreenContext} from './useReadChapterScreenContext';

type Props = {
  url: string;
  readingMode: ReadingMode;
};

const {width, height} = Dimensions.get('screen');

export function RCSChapterImages({url}: Props) {
  const colorScheme = useSelector(
    (state: RootState) => state.userPreferences.colorScheme,
  );
  const styles = getStyles(colorScheme);

  const [imHeight, setImHeight] = useState<number | null>(null);
  const [isError, setIsError] = useState(false);

  const imageScale = useSharedValue(1);
  const imageX = useSharedValue(0);
  const imageY = useSharedValue(0);

  const {locReadingMode} = useReadChapterScreenContext();

  const gestures = Gesture.Race(
    Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        console.log('double tap!');
        if (imageScale.value !== 1) {
          imageScale.value = withTiming(1);
          imageX.value = withTiming(0);
          imageY.value = withTiming(0);
        }
      }),
  );

  const onPageError: FastImageProps['onError'] = () => {
    console.log('error loading page');
    setIsError(true);
  };

  useEffect(() => {
    console.log(`loading page: ${url}`);
    if (locReadingMode === READING_MODES.WEBTOON) {
      Image.getSize(
        url,
        (iWidth, iHeight) => {
          const ratio = iWidth / iHeight;
          const finalHeight = Math.round(width / ratio);
          setImHeight(finalHeight);
        },
        () => {
          setIsError(true);
        },
      );
    } else {
      setImHeight(height);
    }
  }, [locReadingMode, url]);

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text>an error has occured!</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, {height: imHeight ?? undefined}]}>
      {imHeight ? (
        <FastImage
          source={{uri: url, priority: 'high'}}
          resizeMode="contain"
          style={{flex: 1, width: width}}
          onError={onPageError}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingLabel}>loading page...</Text>
        </View>
      )}
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      height: height * 0.3,
      width: width,
    },
    loadingContainer: {
      flex: 1,
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
