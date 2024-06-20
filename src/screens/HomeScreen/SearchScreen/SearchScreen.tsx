import {MangaList} from '@components';
import {ColorScheme, PRETENDARD_JP, TOP_OVERLAY_HEIGHT} from '@constants';
import {BlurView} from '@react-native-community/blur';
import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {RootState} from '@store';
import {textColor} from '@utils';
import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputSubmitEditingEventData,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {useSelector} from 'react-redux';
import {HomeBottomTabsParamsList} from '../HomeScreen';
import {SSBottomSheet} from './SSBottomSheet';
const {height, width} = Dimensions.get('window');

type Props = MaterialTopTabScreenProps<
  HomeBottomTabsParamsList,
  'SearchScreen',
  undefined
>;

export function SearchScreen({}: Props) {
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  const titleInputRef = useRef<TextInput>(null);

  const [title, setTitle] = useState<string>('');
  const [includedTags, setIncludedTags] = useState<string[]>([]);
  const [showFilterBadge, setShowFilterBadge] = useState(false);
  const [showFilterContainer, setShowFilterContainer] = useState(false);
  const [showSearch, setShowSearch] = useState(true);

  const searchBtnAnim = useAnimatedStyle(() => {
    return {
      transform: [{translateY: withSpring(showFilterContainer ? 40 : 0)}],
    };
  });

  function searchIconOnPress() {
    setShowFilterContainer(!showFilterContainer);
    Vibration.vibrate([0, 50], false);
  }

  function titleOnSubmit(
    event: NativeSyntheticEvent<TextInputSubmitEditingEventData>,
  ) {
    setTitle(event.nativeEvent.text);
  }

  function onMangaListScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    Keyboard.dismiss();
    if (!event.nativeEvent.velocity) {
      return;
    }
    if (event.nativeEvent.velocity.y < 0) {
      setShowSearch(true);
    }
    if (event.nativeEvent.velocity.y > 1) {
      setShowSearch(false);
      setShowFilterContainer(false);
    }
  }

  useEffect(() => {
    if (includedTags.length > 0) {
      setShowFilterBadge(true);
      return;
    }

    setShowFilterBadge(false);
  }, [includedTags]);

  return (
    <Animated.View style={[styles.container]}>
      <MangaList
        limit={10}
        title={title}
        includedTags={includedTags}
        contentViewStyle={styles.mangalistContent}
        onScroll={onMangaListScroll}
      />
      {showFilterContainer && <SSBottomSheet />}
      {showSearch && (
        <Animated.View
          entering={SlideInDown}
          exiting={SlideOutDown}
          style={[styles.searchContainer, searchBtnAnim]}>
          <TouchableOpacity onPress={searchIconOnPress}>
            <Animated.Image
              source={require('@assets/icons/magnify.png')}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colorScheme.colors.main,
    },
    searchContainer: {
      position: 'absolute',
      bottom: 20,

      width: width / 7,
      height: width / 7,
      padding: 5,

      backgroundColor: colorScheme.colors.primary,
      borderRadius: 100,
    },
    searchIcon: {
      width: '100%',
      height: '100%',
      tintColor: textColor(colorScheme.colors.primary),
    },
    filterContainer: {
      position: 'absolute',
      bottom: 0,

      height: height * 0.4,
      width: width,
      overflow: 'hidden',

      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
    },
    filterContainerBlur: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '100%',
    },
    title: {
      flex: 1,
      fontSize: 16,
      fontFamily: PRETENDARD_JP.SEMIBOLD,
      color: textColor(colorScheme.colors.primary),
    },
    inputBox: {
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      marginHorizontal: 10,
      borderRadius: 25,
      zIndex: 4,
      backgroundColor: colorScheme.colors.primary,
    },
    inputBoxTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 0,
      paddingHorizontal: 15,
      borderRadius: 25,
      zIndex: 1,
      backgroundColor: colorScheme.colors.primary,
    },
    inputBoxDropDown: {
      height: 0,
      overflow: 'hidden',
    },
    inputBoxDropDownContStyle: {
      paddingHorizontal: 15,
      paddingBottom: 15,
    },
    formLabel: {
      color: textColor(colorScheme.colors.secondary),
      fontFamily: PRETENDARD_JP.SEMIBOLD,
      fontSize: 12,
      marginBottom: 5,
    },
    mangalistContent: {
      paddingTop: TOP_OVERLAY_HEIGHT,
    },
  });
}
