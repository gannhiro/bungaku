import React, {memo} from 'react';
import {Language} from '@constants';
import Animated from 'react-native-reanimated';
import FastImage, {ImageStyle} from 'react-native-fast-image';
import {StyleProp} from 'react-native';

interface Props {
  language: Language;
  style?: StyleProp<ImageStyle>;
}

export const FlagIcon = memo(({language, style}: Props) => {
  if (!language) {
    return null;
  }
  if (language.includes('en')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/gb.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('uk')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/ua.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('el')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/gr.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('ja')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/jp.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('ko')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/kr.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('id')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/id.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('vi')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/vn.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('zh')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/cn.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('ru')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/ru.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('tl')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/tl.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('pt')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/pt.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('br')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/br.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('pl')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/pl.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('ar')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/sa.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('es')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/es.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('it')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/it.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('tr')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/tr.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('mn')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/mn.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }
  if (language.includes('fr')) {
    return (
      <FastImage
        source={require('@assets/flagsPNG/fr.png')}
        style={[style]}
        resizeMode="contain"
      />
    );
  }

  console.log('Flag for: ' + language + ' is missing.');
  return null;
});
