import React from 'react';
import {ColorScheme} from '@constants';
import {Dimensions, ScrollView, StyleSheet, Text} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from '@store';
import Animated, {SlideInDown, SlideOutDown} from 'react-native-reanimated';
import {BlurView} from '@react-native-community/blur';

const {height, width} = Dimensions.get('window');

export function SSBottomSheet() {
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);
  return (
    <Animated.View
      style={styles.container}
      entering={SlideInDown}
      exiting={SlideOutDown}>
      <BlurView
        style={styles.containerBlur}
        blurType={colorScheme.type === 'light' ? 'light' : 'dark'}
        blurAmount={40}
      />
      <ScrollView contentContainerStyle={styles.scrollviewCont}>
        <Text style={styles.filterTypeLabel}>Tags</Text>
      </ScrollView>
    </Animated.View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,

      height: height * 0.4,
      width: width,
      overflow: 'hidden',

      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
    },
    containerBlur: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '100%',
    },
    scrollviewCont: {},
    filterTypeLabel: {},
  });
}
