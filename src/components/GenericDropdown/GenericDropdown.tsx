import React, {Fragment, useEffect, useState} from 'react';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  Vibration,
  ViewStyle,
} from 'react-native';
import {ColorScheme, PRETENDARD_JP} from '@constants';
import {useSelector} from 'react-redux';
import {RootState} from '@store';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {GDRenderItem} from './GDRenderItem';
import {textColor} from '@utils';

export type GenericDropdownValues = {
  label: string;
  subLabel?: string;
  value: string | number | null;
};

type Props = {
  multiple: boolean;
  atLeastOne: boolean;
  items: GenericDropdownValues[];
  value: string | number | null | Array<string | number | null>;
  setValues?: React.Dispatch<React.SetStateAction<Array<any> | any>>;
  onSelectionPress?: (
    value: string | number | null | Array<string | number | null>,
  ) => void;
  onDropdownPress?: () => void;
  style?: ViewStyle;
};

export function GenericDropdown({
  multiple,
  atLeastOne,
  items,
  value,
  setValues,
  onSelectionPress,
  onDropdownPress,
  style,
}: Props) {
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  const [showDropdown, setShowDropdown] = useState(false);

  const chevronImgTransform = useSharedValue(0);
  const chevronImgTransformStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotateZ: withSpring(`${chevronImgTransform.value}deg`)}],
    };
  });

  const dropdownPressableBG = useSharedValue(colorScheme.colors.secondary);
  const dropdownPressableBGStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: dropdownPressableBG.value,
    };
  });

  const selectedBorderRadiusBottom = useSharedValue(10);
  const selectedStyle = useAnimatedStyle(() => {
    return {
      borderBottomLeftRadius: selectedBorderRadiusBottom.value,
      borderBottomRightRadius: selectedBorderRadiusBottom.value,
    };
  });

  const selectionsStyle = useAnimatedStyle(() => {
    return {
      height: items.length > 5 ? 200 : undefined,
      borderColor: dropdownPressableBG.value,
    };
  });

  const tapDropdown = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => {
      onDropdownPress?.();
      setShowDropdown(!showDropdown);

      if (showDropdown) {
        chevronImgTransform.value = 0;
        selectedBorderRadiusBottom.value = 10;
      } else {
        chevronImgTransform.value = 180;
        selectedBorderRadiusBottom.value = 0;
      }
      Vibration.vibrate([0, 50], false);
    });

  function keyExtractor(item: GenericDropdownValues, index: number) {
    return `${item.value} - ${index}`;
  }

  function renderItem({
    item,
    index,
  }: ListRenderItemInfo<GenericDropdownValues>) {
    return (
      <GDRenderItem
        item={item}
        atLeastOne={atLeastOne}
        renderBotBorder={items.length - 1 > index}
        index={index}
        value={value}
        setValues={setValues}
        onSelectionPress={onSelectionPress}
      />
    );
  }

  useEffect(() => {
    dropdownPressableBG.value = withSequence(
      withTiming(colorScheme.colors.secondary + 99, {duration: 100}),
      withTiming(
        showDropdown
          ? colorScheme.colors.primary
          : colorScheme.colors.secondary,
      ),
    );
  }, [colorScheme, dropdownPressableBG, showDropdown]);

  return (
    <Fragment>
      <GestureDetector gesture={tapDropdown}>
        <Animated.View
          style={[
            styles.selectedCont,
            selectedStyle,
            dropdownPressableBGStyle,
            style,
          ]}>
          <Text style={[styles.selectedText]}>
            {!multiple
              ? items.find(item => {
                  if (item.value === value) {
                    return item.label;
                  }
                })?.label
              : value && Array.isArray(value) && value.length > 0
              ? value.length > 3
                ? value.length + ' items selected'
                : items.map((item, index) => {
                    if (value.includes(item.value)) {
                      if (index < value.length - 1) {
                        return `${item.label}, `;
                      }
                      return item.label;
                    }
                  })
              : 'None Selected'}
          </Text>
          <Animated.Image
            source={require('../../../assets/icons/chevron-down.png')}
            style={[styles.selectedDownIcon, chevronImgTransformStyle]}
          />
        </Animated.View>
      </GestureDetector>
      {showDropdown && (
        <Animated.View
          entering={FadeInDown}
          style={[styles.selectionDropdownCont, selectionsStyle]}>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            nestedScrollEnabled={items.length > 5}
          />
        </Animated.View>
      )}
    </Fragment>
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
      borderWidth: 2,
      borderTopWidth: 0,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      borderColor: colorScheme.colors.main,
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
