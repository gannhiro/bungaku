import React from 'react';
import {Image, StyleSheet, ImageStyle} from 'react-native';
import {res_get_manga} from '@api';
import {systemIndigo, systemOrange, systemPink, systemTeal} from '@constants';

interface Props {
  contentRating: res_get_manga['data'][0]['attributes']['contentRating'];
}

export function MangaListRenderItemContRatIcon({contentRating}: Props) {
  const safeIconStyle: ImageStyle = {
    tintColor: systemTeal,
  };
  const suggestiveIconStyle: ImageStyle = {
    tintColor: systemOrange,
  };
  const eroticaIconStyle: ImageStyle = {
    tintColor: systemPink,
  };
  const pGraphicIconStyle: ImageStyle = {
    tintColor: systemIndigo,
  };

  if (contentRating === 'safe') {
    return (
      <Image
        source={require('../../../assets/icons/heart.png')}
        style={[styles.coverImageOverlayIcons, safeIconStyle]}
      />
    );
  }
  if (contentRating === 'suggestive') {
    return (
      <Image
        source={require('../../../assets/icons/devil-heartv2.png')}
        style={[styles.coverImageOverlayIcons, suggestiveIconStyle]}
      />
    );
  }
  if (contentRating === 'erotica') {
    return (
      <Image
        source={require('../../../assets/icons/devil-heartv2.png')}
        style={[styles.coverImageOverlayIcons, eroticaIconStyle]}
      />
    );
  }
  if (contentRating === 'pornographic') {
    return (
      <Image
        source={require('../../../assets/icons/devil-heartv2.png')}
        style={[styles.coverImageOverlayIcons, pGraphicIconStyle]}
      />
    );
  }

  return null;
}

const styles = StyleSheet.create({
  coverImageOverlayIcons: {
    width: 15,
    height: 15,
  },
});
