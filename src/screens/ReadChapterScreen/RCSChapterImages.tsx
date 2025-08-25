import {ColorScheme} from '@constants';
import {textColor, useAppCore} from '@utils';
import React, {memo, useEffect, useState} from 'react';
import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';
import FastImage, {FastImageProps} from 'react-native-fast-image';
import {Gesture} from 'react-native-gesture-handler';
import {useSharedValue, withTiming} from 'react-native-reanimated';
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
  const {colorScheme} = useAppCore();

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
        <FastImage
          source={{uri: path, priority: 'high'}}
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
