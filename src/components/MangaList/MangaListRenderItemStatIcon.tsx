import React from 'react';
import {Image, StyleSheet, ImageStyle} from 'react-native';
import {res_get_manga} from '@api';
import {systemGreen, systemOrange, systemRed, systemTeal} from '@constants';

interface Props {
  status: res_get_manga['data'][0]['attributes']['status'];
  style?: ImageStyle;
}

export function MangaListRenderItemStatIcon({status, style}: Props) {
  const completedIconStyle: ImageStyle = {
    tintColor: systemTeal,
  };
  const ongoingIconStyle: ImageStyle = {
    tintColor: systemGreen,
  };
  const hiatusIconStyle: ImageStyle = {
    tintColor: systemOrange,
  };
  const cancelledIconStyle: ImageStyle = {
    tintColor: systemRed,
  };

  if (status === 'completed') {
    return (
      <Image
        source={require('@assets/icons/check-circle.png')}
        style={[styles.coverImageOverlayIcons, completedIconStyle, style]}
      />
    );
  } else if (status === 'ongoing') {
    return (
      <Image
        source={require('@assets/icons/check-circle.png')}
        style={[styles.coverImageOverlayIcons, ongoingIconStyle, style]}
      />
    );
  } else if (status === 'hiatus') {
    return (
      <Image
        source={require('@assets/icons/dots-horizontal-circle.png')}
        style={[styles.coverImageOverlayIcons, hiatusIconStyle, style]}
      />
    );
  } else if (status === 'cancelled') {
    return (
      <Image
        source={require('@assets/icons/close-circle.png')}
        style={[styles.coverImageOverlayIcons, cancelledIconStyle, style]}
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
