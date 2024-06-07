import {MangaList, MangaTagsDropdown, SearchFilterIcon} from '@components';
import {ColorScheme, PRETENDARD_JP, TOP_OVERLAY_HEIGHT} from '@constants';
import {RootState} from '@store';
import {textColor} from '@utils';
import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  TextInput,
  StatusBar,
  Vibration,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  NativeScrollEvent,
  Keyboard,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import {useSelector} from 'react-redux';
const {height} = Dimensions.get('window');

export function SearchScreen() {
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  const titleInputRef = useRef<TextInput>(null);

  const [title, setTitle] = useState<string>('');
  const [includedTags, setIncludedTags] = useState<string[]>([]);
  const [showFilterBadge, setShowFilterBadge] = useState(false);

  const inputBoxHeight = useSharedValue(0);
  const inputBoxDropdownStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(inputBoxHeight.value, {easing: Easing.cubic}),
    };
  });

  const inputBoxYStyle = useSharedValue(TOP_OVERLAY_HEIGHT);
  const titleInputBoxYPosStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: inputBoxYStyle.value}],
    };
  });

  function searchIconOnPress() {
    if (inputBoxHeight.value === 0) {
      inputBoxHeight.value = height * 0.5;
    } else {
      inputBoxHeight.value = 0;
    }
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
      inputBoxYStyle.value = withSpring(TOP_OVERLAY_HEIGHT, {
        velocity: 500,
      });
    }
    if (event.nativeEvent.velocity.y > 1) {
      inputBoxYStyle.value = withTiming(-100, {
        duration: 200,
        easing: Easing.out(Easing.linear),
      });

      if (inputBoxHeight.value > 0) {
        inputBoxHeight.value = 0;
      }
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
      <Animated.View style={[styles.inputBox, titleInputBoxYPosStyle]}>
        <Animated.View style={[styles.inputBoxTitle]}>
          <TextInput
            blurOnSubmit={true}
            placeholder="Search Manga"
            ref={titleInputRef}
            placeholderTextColor={textColor(colorScheme.colors.primary)}
            style={[styles.title]}
            onSubmitEditing={titleOnSubmit}
          />
          <SearchFilterIcon
            filterIconOnPress={searchIconOnPress}
            showBadge={showFilterBadge}
          />
        </Animated.View>

        <Animated.ScrollView
          style={[styles.inputBoxDropDown, inputBoxDropdownStyle]}
          contentContainerStyle={styles.inputBoxDropDownContStyle}>
          <Animated.Text style={styles.formLabel}>Tags</Animated.Text>
          <MangaTagsDropdown
            setIncludedTags={setIncludedTags}
            includedTags={includedTags}
          />
        </Animated.ScrollView>
      </Animated.View>

      <MangaList
        limit={10}
        title={title}
        includedTags={includedTags}
        contentViewStyle={styles.mangalistContent}
        onScroll={onMangaListScroll}
      />
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
    searchIcon: {
      width: 25,
      height: 25,
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
      paddingTop:
        StatusBar.currentHeight && 0.09 * height + StatusBar.currentHeight + 15,
    },
  });
}
