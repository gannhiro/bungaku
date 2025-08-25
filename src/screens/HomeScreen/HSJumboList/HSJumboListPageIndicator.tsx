import {StyleSheet, View} from 'react-native';
import React, {Fragment} from 'react';
import {HSJLPageIndicatorDot} from './HSJLPageIndicatorDot';
import {ColorScheme} from '@constants';
import {useAppCore} from '@utils';

type Props = {
  currentPage: number;
};

export function HSJumboListPageIndicator({currentPage}: Props) {
  const {colorScheme} = useAppCore();

  const styles = getStyles(colorScheme);

  return (
    <View style={styles.dotsContainer}>
      {Array(15)
        .fill(0)
        .map((_, index) => {
          return (
            <Fragment key={index}>
              <HSJLPageIndicatorDot currentPage={currentPage} index={index} />
            </Fragment>
          );
        })}
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    dotsContainer: {
      marginTop: 20,
      height: 13,
      zIndex: 4,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      paddingHorizontal: 50,
    },
  });
}
