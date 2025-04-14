import {ColorScheme, PRETENDARD_JP, TOP_OVERLAY_HEIGHT} from '@constants';
import {RootStackParamsList} from '@navigation';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootState, useAppSelector} from '@store';
import {textColor} from '@utils';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {LibraryList} from '@components';

export function LibraryScreen() {
  const navigation =
    useNavigation<
      StackNavigationProp<RootStackParamsList, 'HomeScreen', undefined>
    >();
  const {colorScheme} = useAppSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  return (
    <View style={styles.container}>
      <Text style={styles.libraryLabel}>Library</Text>
      <LibraryList />
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      paddingTop: TOP_OVERLAY_HEIGHT,
      alignItems: 'center',
      flex: 1,
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
