import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '@store';
import {Pressable, StyleSheet, View, ViewStyle} from 'react-native';
import {
  ColorScheme,
  PRETENDARD_JP,
  systemBlue,
  systemBrown,
  systemYellow,
} from '@constants';
import Animated, {SlideInRight, SlideOutRight} from 'react-native-reanimated';
import {res_get_manga_tag} from '@api';

type Props = {
  tag: res_get_manga_tag['data'][0];
  tags: res_get_manga_tag;
  includedTags: string[];
  index: number;
  onSelectionPress: (id: string) => void;
};

export const MTDItem = memo(
  ({tag, tags, includedTags, index, onSelectionPress}: Props) => {
    console.log('rerendered');
    const {colorScheme} = useSelector(
      (state: RootState) => state.userPreferences,
    );
    const styles = getStyles(colorScheme);
    const selected = includedTags.includes(tag.id);
    const border: ViewStyle = {
      borderBottomWidth: index < tags?.data.length - 1 ? 1 : 0,
      borderColor: colorScheme.colors.main,
    };
    let groupIndicatorColor: ViewStyle = {
      backgroundColor: systemBlue,
    };
    if (tag.attributes.group === 'theme') {
      groupIndicatorColor.backgroundColor = systemYellow;
    }
    if (tag.attributes.group === 'genre') {
      groupIndicatorColor.backgroundColor = systemBrown;
    }

    return (
      <Pressable
        onPress={() => onSelectionPress(tag.id)}
        style={[styles.selections, border]}
        key={tag.id}>
        <View style={styles.selectionGroup}>
          <View style={[styles.selectionGroupIndicator, groupIndicatorColor]} />
          <Animated.Text style={[styles.selectionText]}>
            {tag.attributes.name.en}
          </Animated.Text>
        </View>

        {selected && (
          <Animated.Image
            entering={SlideInRight.delay(300)}
            exiting={SlideOutRight.delay(300)}
            source={require('../../../assets/icons/check.png')}
            style={[styles.selectionCheckIcon]}
          />
        )}
      </Pressable>
    );
  },
  (prev, next) => {
    return prev.includedTags.length === next.includedTags.length;
  },
);

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    selections: {
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      padding: 10,
    },
    selectionGroup: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectionGroupIndicator: {
      width: 8,
      height: 8,
      borderRadius: 10,
      marginRight: 5,
    },
    selectionCheckIcon: {
      width: 20,
      height: 20,
    },
    selectionText: {
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 14,
    },
  });
}
