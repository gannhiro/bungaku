import {ColorScheme, PRETENDARD_JP} from '@constants';
import {RootState} from '@store';
import {textColor} from '@utils';
import React, {Dispatch, SetStateAction, useState} from 'react';
import {
  ListRenderItemInfo,
  StyleSheet,
  Text,
  Vibration,
  View,
  ViewStyle,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  EntryAnimationsValues,
  EntryExitAnimationFunction,
  ExitAnimationsValues,
  LayoutAnimation,
  runOnJS,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useSelector} from 'react-redux';
import {DropdownRenderItem} from './DropdownRenderItem';

export type GenericDropdownValues = {
  label: string;
  subLabel?: string;
  value: string | number | null;
}[];

type Props = {
  items: GenericDropdownValues;
  selection: string | number | Array<string | number>;
  setSelection: Dispatch<SetStateAction<any>>;
  atLeastOne?: boolean;
  onSelectionPress?: (value: string | number | null) => void;
  onDropdownPress?: () => void;
  style?: ViewStyle;
};

export function Dropdown({
  atLeastOne = false,
  items,
  selection,
  setSelection,
  onSelectionPress,
  onDropdownPress,
  style,
}: Props) {
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  const [showDropdown, setShowDropdown] = useState(false);

  const chevronImgTransformStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {rotate: showDropdown ? withSpring('180deg') : withSpring('0deg')},
      ],
    };
  });

  const dropdownPressableStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withSequence(
        withTiming(colorScheme.colors.secondary + 99, {duration: 100}),
        withTiming(
          showDropdown
            ? colorScheme.colors.primary
            : colorScheme.colors.secondary,
        ),
      ),
      borderBottomLeftRadius: showDropdown
        ? 0
        : withDelay(100, withTiming(10, {duration: 250})),
      borderBottomRightRadius: showDropdown
        ? 0
        : withDelay(100, withTiming(10, {duration: 250})),
    };
  });

  const tapDropdown = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => {
      if (onDropdownPress) {
        onDropdownPress();
      }
      setShowDropdown(!showDropdown);
      runOnJS(Vibration.vibrate)([0, 50], false);
    });

  const dropdownEnterLayoutAnim: EntryExitAnimationFunction = (
    targetValues: EntryAnimationsValues,
  ) => {
    'worklet';
    const initialValues: LayoutAnimation['initialValues'] = {
      height: 0,
    };

    const animations: LayoutAnimation['animations'] = {
      height: withTiming(targetValues.targetHeight, {duration: 250}),
    };

    return {
      initialValues,
      animations,
    };
  };

  const dropdownExitLayoutAnim: EntryExitAnimationFunction = (
    currentValues: ExitAnimationsValues,
  ) => {
    'worklet';
    const initialValues: LayoutAnimation['initialValues'] = {
      height: currentValues.currentHeight,
    };

    const animations: LayoutAnimation['animations'] = {
      height: withTiming(0, {duration: 250}),
    };

    return {
      initialValues,
      animations,
    };
  };

  function keyExtractor(item: GenericDropdownValues[0], index: number) {
    return `${item.value} - ${index}`;
  }

  function renderItem({
    item,
    index,
  }: ListRenderItemInfo<GenericDropdownValues[0]>) {
    return (
      <DropdownRenderItem
        item={item}
        atLeastOne={atLeastOne}
        renderBotBorder={items.length - 1 > index}
        selection={selection}
        setSelection={setSelection}
        onSelectionPress={onSelectionPress}
      />
    );
  }

  return (
    <View>
      <GestureDetector gesture={tapDropdown}>
        <Animated.View
          style={[styles.selectedCont, dropdownPressableStyle, style]}>
          <Text style={[styles.selectedText]}>
            {Array.isArray(selection)
              ? selection.length > 0
                ? selection.length < 4
                  ? selection.map((val, index) => {
                      if (
                        index === selection.length - 1 ||
                        selection.length === 1
                      ) {
                        return items.find(item => item.value === val)?.label;
                      }
                      return `${
                        items.find(item => item.value === val)?.label
                      }, `;
                    })
                  : `${selection.length} items selected`
                : 'No Selection'
              : items.find(item => item.value === selection)?.label ??
                'No Selection'}
          </Text>
          <Animated.Image
            source={require('@assets/icons/chevron-down.png')}
            style={[styles.selectedDownIcon, chevronImgTransformStyle]}
          />
        </Animated.View>
      </GestureDetector>
      {showDropdown && (
        <Animated.View
          entering={dropdownEnterLayoutAnim}
          exiting={dropdownExitLayoutAnim}
          style={[styles.selectionDropdownCont]}>
          <Animated.FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            nestedScrollEnabled={true}
            maxToRenderPerBatch={5}
            windowSize={10}
            removeClippedSubviews={false}
          />
        </Animated.View>
      )}
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      alignSelf: 'stretch',
    },
    selectedCont: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      borderRadius: 10,
    },
    selectedText: {
      fontFamily: PRETENDARD_JP.BOLD,
      fontSize: 14,
      color: textColor(colorScheme.colors.primary),
    },
    selectionDropdownCont: {
      maxHeight: 200,
      borderWidth: 2,
      borderTopWidth: 0,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      borderColor: colorScheme.colors.primary,
      backgroundColor: colorScheme.colors.secondary,
      overflow: 'hidden',
    },
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
    selectedDownIcon: {
      width: 25,
      height: 25,
      tintColor: textColor(colorScheme.colors.primary),
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
      color: textColor(colorScheme.colors.main),
    },
  });
}
