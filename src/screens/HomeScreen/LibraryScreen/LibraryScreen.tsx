import {ColorScheme, PRETENDARD_JP, TOP_OVERLAY_HEIGHT} from '@constants';
import {textColor, useAppCore} from '@utils';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {EnhancedLibraryList} from '@components';

export function LibraryScreen() {
  const {colorScheme} = useAppCore();

  const styles = getStyles(colorScheme);

  return (
    <View style={styles.container}>
      <Text style={styles.libraryLabel}>Library</Text>
      <EnhancedLibraryList />
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      paddingTop: TOP_OVERLAY_HEIGHT,
      alignItems: 'center',
      flex: 1,
      backgroundColor: colorScheme.colors.main,
    },
    libraryLabel: {
      fontFamily: PRETENDARD_JP.LIGHT,
      color: textColor(colorScheme.colors.main),
      fontSize: 24,
    },
    listCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
