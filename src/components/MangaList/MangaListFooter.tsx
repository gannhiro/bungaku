import {ColorScheme, PRETENDARD_JP} from '@constants';
import {RootState, useAppSelector} from '@store';
import React, {Fragment} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import * as Progress from 'react-native-progress';
import {textColor, useInternetConn} from '@utils';

export function MangaListFooter() {
  const intError = useInternetConn();
  const {colorScheme} = useAppSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);
  return (
    <View style={styles.container}>
      {intError ? (
        <Fragment>
          <Text style={styles.loadingLabel}>you have no internet dummy!</Text>
        </Fragment>
      ) : (
        <Fragment>
          <Progress.CircleSnail
            color={textColor(colorScheme.colors.main)}
            size={30}
          />
          <Text style={styles.loadingLabel}>loading!</Text>
        </Fragment>
      )}
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingLabel: {
      fontFamily: PRETENDARD_JP.REGULAR,
      color: textColor(colorScheme.colors.main),
    },
  });
}
