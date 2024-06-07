import React, {memo, useEffect, useState} from 'react';
import {Dimensions, Image, StyleSheet} from 'react-native';
import {useSharedValue, withTiming} from 'react-native-reanimated';
import {useSelector} from 'react-redux';
import {RootState} from '../../store/store';
import {Gesture} from 'react-native-gesture-handler';
import {READING_MODES, ReadingMode} from './ReadChapterScreen';
import {ColorScheme} from '@constants';
import FastImage from 'react-native-fast-image';

type Props = {
  url: string;
  readingMode: ReadingMode;
};

const {width, height} = Dimensions.get('screen');

export const RCSChapterImages = memo(
  ({url, readingMode}: Props) => {
    const colorScheme = useSelector(
      (state: RootState) => state.userPreferences.colorScheme,
    );
    const styles = getStyles(colorScheme);

    const [loading, setLoading] = useState(true);
    const [imHeight, setImHeight] = useState(height);

    const imageScale = useSharedValue(1);
    const imageX = useSharedValue(0);
    const imageY = useSharedValue(0);

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

    function onLoadStart() {}

    function onLoadEnd() {
      console.log('load end');
      if (loading) {
        setLoading(false);
      }
    }

    useEffect(() => {
      if (readingMode === 'webtoon') {
        Image.getSize(
          url,
          (iWidth, iHeight) => {
            const ratio = iWidth / iHeight;
            setImHeight(Math.round(width / ratio));
          },
          e => {
            console.log(e);
          },
        );
      } else {
        setImHeight(height);
      }
    }, [readingMode, url]);

    return (
      <FastImage
        source={{uri: url}}
        resizeMode="contain"
        style={{height: imHeight, width: width, overflow: 'hidden'}}
        key={Date.now()}
        onLoadEnd={onLoadEnd}
        onLoadStart={onLoadStart}
      />
    );
  },
  (prev, next) => prev.readingMode === next.readingMode,
);

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    imageOverlay: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    normalPage: {
      height: height,
      width: width,
    },
  });
}
