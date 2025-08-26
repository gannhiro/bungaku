import React, {Fragment, useEffect, useState} from 'react';
import {
  ListRenderItem,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Vibration,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  FadeInDown,
  SlideInRight,
  SlideOutRight,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {res_get_manga_tag} from '@api';
import {PRETENDARD_JP, ColorScheme, systemBlue, systemBrown, systemYellow} from '@constants';
import {mangadexAPI} from '@api';
import {setMangaTags, RootState, setError, useAppSelector} from '@store';
import {textColor, useAppCore} from '@utils';

type Props = {
  includedTags: string[];
  setIncludedTags: React.Dispatch<React.SetStateAction<string[]>>;
  style?: ViewStyle;
};

export function MangaTagsDropdown({includedTags, setIncludedTags, style}: Props) {
  const {dispatch, colorScheme} = useAppCore<'HomeNavigator'>();

  const {tags} = useAppSelector((state: RootState) => state.mangaTags);

  const styles = getStyles(colorScheme);

  const [showTags, setShowTags] = useState(false);

  const chevronImgTransform = useSharedValue(0);
  const chevronImgTransformStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotateZ: withSpring(`${chevronImgTransform.value}deg`)}],
    };
  });

  const dropdownPressableBG = useSharedValue(colorScheme.colors.main);
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

  function renderItem({item, index}: ListRenderItemInfo<res_get_manga_tag['data'][0]>) {
    if (!tags) {
      return;
    }
    const selected = includedTags.includes(item.id);
    const border: ViewStyle = {
      borderBottomWidth: index < tags?.length - 1 ? 1 : 0,
      borderColor: colorScheme.colors.main,
    };
    let groupIndicatorColor: ViewStyle = {
      backgroundColor: systemBlue,
    };
    if (item.attributes.group === 'theme') {
      groupIndicatorColor.backgroundColor = systemYellow;
    }
    if (item.attributes.group === 'genre') {
      groupIndicatorColor.backgroundColor = systemBrown;
    }

    return (
      <Pressable
        onPress={() => selectionOnPress(item.id)}
        style={[styles.selections, style, border]}
        key={item.id}>
        <View style={styles.selectionGroup}>
          <View style={[styles.selectionGroupIndicator, groupIndicatorColor]} />
          <Animated.Text style={[styles.selectionText]}>{item.attributes.name.en}</Animated.Text>
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
  }

  function dropdownOnPress() {
    dropdownPressableBG.value = withSequence(
      withTiming(colorScheme.colors.secondary + 99, {duration: 100}),
      withTiming(colorScheme.colors.main, undefined, isfinished => {
        if (isfinished) {
          runOnJS(setShowTags)(!showTags);
        }
      }),
    );
    Vibration.vibrate([0, 50], false);
  }

  function selectionOnPress(tag: string) {
    const tempIncludedTags = [...includedTags];
    const included = tempIncludedTags.includes(tag);

    if (included) {
      tempIncludedTags.splice(tempIncludedTags.indexOf(tag), 1);
    } else {
      tempIncludedTags.push(tag);
    }

    setIncludedTags(tempIncludedTags);
  }

  const tapDropdown = Gesture.Tap().onEnd(() => {
    runOnJS(dropdownOnPress)();
  });

  useEffect(() => {
    if (!tags) {
      (async () => {
        const data = await mangadexAPI<res_get_manga_tag, {}>('get', '/manga/tag', {}, []);
        if (data && data.result === 'ok') {
          dispatch(setMangaTags(data['data']));
        } else if (data && data.result === 'error') {
          dispatch(setError(data));
        }
      })();
    }
  }, [dispatch, tags]);

  useEffect(() => {
    if (!showTags) {
      chevronImgTransform.value = 0;
      selectedBorderRadiusBottom.value = 10;
    } else {
      chevronImgTransform.value = 180;
      selectedBorderRadiusBottom.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTags]);

  if (tags) {
    return (
      <Fragment>
        <GestureDetector gesture={tapDropdown}>
          <Animated.View style={[styles.selectedCont, selectedStyle, dropdownPressableBGStyle]}>
            <Animated.Text style={[styles.selectedText]}>
              {includedTags.length > 0
                ? includedTags.length > 3
                  ? includedTags.length + ' tags selected'
                  : includedTags.map((tagString, index) => {
                      let labelString = '';
                      tags?.forEach(tag => {
                        if (tagString === tag.id) {
                          labelString = tag.attributes.name.en;
                        }
                      });
                      if (index < includedTags.length - 1) {
                        labelString += ', ';
                      }
                      return labelString;
                    })
                : 'Select Tags'}
            </Animated.Text>
            <Animated.Image
              source={require('../../../assets/icons/chevron-down.png')}
              style={[styles.selectedDownIcon, chevronImgTransformStyle]}
            />
          </Animated.View>
        </GestureDetector>
        {showTags && (
          <Animated.FlatList
            entering={FadeInDown}
            style={[styles.selectionDropdownCont]}
            data={tags}
            renderItem={renderItem as ListRenderItem<res_get_manga_tag['data'][0]>}
            nestedScrollEnabled
            initialNumToRender={tags.length}
          />
        )}
      </Fragment>
    );
  }

  return null;
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
      backgroundColor: colorScheme.colors.main,
    },
    selectedText: {
      fontFamily: PRETENDARD_JP.BOLD,
      fontSize: 14,
      color: textColor(colorScheme.colors.main),
    },
    selectionDropdownCont: {
      height: 200,

      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      overflow: 'hidden',

      backgroundColor: colorScheme.colors.secondary,
      borderWidth: 1,
      borderColor: colorScheme.colors.main,
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
      tintColor: textColor(colorScheme.colors.main),
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
      tintColor: colorScheme.colors.secondary,
    },
    selectionText: {
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 14,
      color: textColor(colorScheme.colors.main),
    },
  });
}
