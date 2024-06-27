import {ColorScheme, PRETENDARD_JP} from '@constants';
import {View, StyleSheet, Text} from 'react-native';
import Animated, {
  runOnJS,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {GenericDropdownValues} from './GenericDropdown';
import React, {useEffect, useState} from 'react';
import {RootState} from '@store';
import {useSelector} from 'react-redux';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {textColor} from '@utils';

type Props = {
  item: GenericDropdownValues;
  renderBotBorder: boolean;
  index: number;
  value: string | number | null | Array<string | number | null>;
  atLeastOne?: boolean;
  setValues?: React.Dispatch<React.SetStateAction<any | Array<any>>>;
  onSelectionPress?: (
    value: string | number | null | Array<string | number | null>,
  ) => void;
};

export function GDRenderItem({
  item,
  atLeastOne,
  renderBotBorder,
  value,
  setValues,
  onSelectionPress = () => {},
}: Props) {
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);
  const [selected, setSelected] = useState(false);

  const renderItemBG = useSharedValue('#0000');
  const renderItemStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: renderItemBG.value,
      borderBottomWidth: renderBotBorder ? 1 : 0,
    };
  });

  const tap = Gesture.Tap()
    .onBegin(() => {
      renderItemBG.value = withSequence(
        withTiming(colorScheme.colors.secondary, {duration: 10}),
        withTiming('#0000', undefined),
      );
    })
    .onEnd(() => {
      if (Array.isArray(value)) {
        const tempValues = [...value];
        const included = tempValues.findIndex(val => val === item.value);

        if (included !== -1) {
          // remove item
          if (atLeastOne && tempValues.length === 1) {
            return;
          }

          tempValues.splice(included, 1);
          if (setValues) {
            runOnJS(setValues)(tempValues);
          }
          runOnJS(onSelectionPress)(tempValues);
        } else {
          // add item
          tempValues.push(item.value);
          if (setValues) {
            runOnJS(setValues)(tempValues);
          }
          runOnJS(onSelectionPress)(tempValues);
        }
      } else {
        if (value !== item.value) {
          if (setValues) {
            runOnJS(setValues)(item.value);
          }
          runOnJS(onSelectionPress)(item.value);
        }
      }
    });

  useEffect(() => {
    if (Array.isArray(value)) {
      const included = value.includes(item.value);

      if (included) {
        setSelected(true);
      } else {
        setSelected(false);
      }
    } else {
      if (item.value === value) {
        setSelected(true);
      } else {
        setSelected(false);
      }
    }
  }, [item.value, value]);

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.selections, renderItemStyle]}>
        <View style={styles.selectionGroup}>
          <Text style={[styles.selectionText]}>{item.label}</Text>
        </View>
        {selected && (
          <Animated.Image
            entering={SlideInRight.delay(300)}
            source={require('@assets/icons/check.png')}
            style={[styles.selectionCheckIcon]}
          />
        )}
      </Animated.View>
    </GestureDetector>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    selections: {
      borderColor: colorScheme.colors.primary,
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      padding: 10,
    },
    selectionGroup: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectionCheckIcon: {
      width: 20,
      height: 20,
      tintColor: textColor(colorScheme.colors.secondary),
    },
    selectionText: {
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 14,
      color: textColor(colorScheme.colors.secondary),
    },
  });
}
