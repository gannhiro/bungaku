import {ColorScheme, PRETENDARD_JP} from '@constants';
import {View, StyleSheet, Text} from 'react-native';
import Animated, {
  SlideInRight,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {GenericDropdownValues} from './Dropdown';
import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {RootState} from '@store';
import {useSelector} from 'react-redux';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {textColor} from '@utils';

type Props = {
  item: GenericDropdownValues[0];
  renderBotBorder: boolean;
  selection: string | number | null | Array<string | number | null>;
  setSelection: Dispatch<
    SetStateAction<string | number | null | Array<string | number | null>>
  >;
  atLeastOne: boolean;
  onSelectionPress?: (value: string | number | null) => void;
};

export function DropdownRenderItem({
  item,
  selection,
  setSelection,
  renderBotBorder,
  onSelectionPress,
  atLeastOne,
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
    .runOnJS(true)
    .onBegin(() => {
      renderItemBG.value = withSequence(
        withTiming(colorScheme.colors.secondary, {duration: 10}),
        withTiming('#0000', undefined),
      );
    })
    .onEnd(() => {
      if (onSelectionPress) {
        onSelectionPress(item.value);
      }

      if (Array.isArray(selection)) {
        const temp = [...selection];
        const includedIndex = selection.findIndex(s => s === item.value);
        console.log(includedIndex);
        console.log(temp);

        if (includedIndex !== -1) {
          if (atLeastOne && temp.length === 1) {
            return;
          }

          temp.splice(includedIndex, 1);

          setSelection(temp);
          return;
        }

        temp.push(item.value);
        setSelection(temp);
        return;
      }

      if (item.value === selection && !atLeastOne) {
        setSelection(null);
        return;
      }

      setSelection(item.value);
    });

  useEffect(() => {
    if (Array.isArray(selection)) {
      const included = selection.includes(item.value);

      if (included) {
        setSelected(true);
        return;
      }
      setSelected(false);
      return;
    }

    if (item.value === selection) {
      setSelected(true);
      return;
    }
    setSelected(false);
  }, [item.value, selection]);

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.selections, renderItemStyle]}>
        <View style={styles.selectionGroup}>
          <Text style={[styles.selectionLabel]}>{item.label}</Text>
          {item.subLabel && (
            <Text style={[styles.selectionSubLabel]}>{item.subLabel}</Text>
          )}
        </View>
        {selected && (
          <Animated.Image
            entering={SlideInRight}
            exiting={SlideOutRight.delay(50)}
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
    selectionGroup: {},
    selectionCheckIcon: {
      width: 20,
      height: 20,
      tintColor: textColor(colorScheme.colors.secondary),
    },
    selectionLabel: {
      fontFamily: PRETENDARD_JP.BOLD,
      fontSize: 16,
      color: textColor(colorScheme.colors.secondary),
    },
    selectionSubLabel: {
      fontFamily: PRETENDARD_JP.LIGHT,
      fontSize: 11,
      color: textColor(colorScheme.colors.secondary),
    },
  });
}
