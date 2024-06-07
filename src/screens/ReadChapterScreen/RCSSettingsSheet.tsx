import {GenericDropdown} from '@components';
import {ColorScheme, PRETENDARD_JP} from '@constants';
import {RootState, user} from '@store';
import {textColor} from '@utils';
import React, {SetStateAction} from 'react';
import {
  ScrollView,
  Text,
  View,
  Switch,
  Button,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';

const {width, height} = Dimensions.get('screen');

type Props = {
  showSettingsSheet: boolean;
  chapter: 
};

export function RCSSettingsSheet({showSettingsSheet}: Props) {
  const dispatch = useDispatch();
  const {colorScheme, preferDataSaver, readingMode} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);
  const statbarHeight = StatusBar.currentHeight ? StatusBar.currentHeight : 0;

  const sharedReadMode = useSharedValue('horizontal');
  const settingsSheetStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(
        sharedReadMode.value === 'horizontal' ? height * 0.45 : height,
      ),
      width: withTiming(
        sharedReadMode.value === 'horizontal' ? width : width * 0.6,
      ),
      borderTopRightRadius: sharedReadMode.value === 'horizontal' ? 30 : 0,
      borderTopLeftRadius: sharedReadMode.value === 'horizontal' ? 30 : 0,
      paddingTop: sharedReadMode.value !== 'horizontal' ? statbarHeight * 3 : 0,
    };
  });

  if (showSettingsSheet) {
    return (
      <Animated.View
        entering={SlideInDown}
        exiting={SlideOutDown}
        style={[styles.settingsSheet, settingsSheetStyle]}>
        <ScrollView
          contentContainerStyle={styles.settingsSheetScrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <Text style={styles.settingsSheetHeader}>
            {chapters[currentChapter].attributes.title
              ? chapters[currentChapter].attributes.title
              : 'No Chapter Title'}
          </Text>
          <Text style={styles.settingsSheetSmall}>
            {chapters[currentChapter].id}
          </Text>
          <Text style={styles.settingsSheetSmall}>
            Chapter {chapters[currentChapter].attributes.chapter}
          </Text>

          <Text style={styles.settingsSheetSmall}>Scanlator: </Text>
          <Text style={styles.settingsSheetSmall}>Uploaded by User: </Text>

          <View style={styles.settingsSheetGroup}>
            <Text style={styles.settingsSheetSmall}>Reading Mode</Text>
            <GenericDropdown
              multiple={false}
              items={readingModes}
              value={locReadingMode}
              setValues={
                setLocReadingMode as React.Dispatch<
                  SetStateAction<string | number | Array<string | number>>
                >
              }
              onSelectionPress={() => {
                setShowBottomOverlay(false);
              }}
            />
          </View>
          <View style={styles.settingsSheetGroup}>
            <Text style={styles.settingsSheetSmall}>Chapter</Text>
            <GenericDropdown
              multiple={false}
              items={chapters.map((chapter, index) => {
                return {
                  label: 'Chapter ' + chapter.attributes.chapter,
                  value: index,
                };
              })}
              value={currentChapter}
              setValues={
                setCurrentChapter as React.Dispatch<
                  SetStateAction<string | number | Array<string | number>>
                >
              }
              onSelectionPress={() => {
                setShowBottomOverlay(false);
              }}
            />
          </View>
          <View style={styles.settingsSheetGroupRow}>
            <Text style={styles.settingsSheetReg}>Data Saver</Text>
            <Switch
              value={isDataSaver}
              onValueChange={onDataSaverSwitchChange}
            />
          </View>

          <Button
            title="Go Back"
            onButtonPress={() => {
              navigation.goBack();
            }}
            containerStyle={{marginTop: 20}}
          />
        </ScrollView>
      </Animated.View>
    );
  }
  return null;
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: width,
    },
    bottomOverlay: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      position: 'absolute',
      bottom: 20,
      right: 0,
      left: 0,
    },
    chapterOverlay: {
      borderRadius: 15,
      backgroundColor: colorScheme.colors.main + 99,
      width: width * 0.6,
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
    },
    chapterOverlayTitleLabel: {
      color: textColor(colorScheme.colors.main),
      textAlign: 'center',
      fontFamily: PRETENDARD_JP.BOLD,
      fontSize: 18,
    },
    chapterOverlayChapLabel: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 8,
    },
    nextBtnContainer: {
      padding: 10,
      backgroundColor: colorScheme.colors.secondary,
    },
    prevBtnContainer: {
      padding: 10,
      backgroundColor: colorScheme.colors.secondary,
    },
    pageProgressBar: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: 0,
    },
    blurView: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    settingsSheet: {
      right: 0,
      bottom: 0,
      position: 'absolute',
      backgroundColor: colorScheme.colors.main,
      overflow: 'hidden',
    },
    settingsSheetScrollView: {
      padding: 20,
    },
    settingsSheetHeader: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.BOLD,
      fontSize: 18,
    },
    settingsSheetSmall: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 10,
    },
    settingsSheetReg: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 14,
    },
    nextPrevLabels: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 10,
    },
    settingsSheetGroup: {
      marginTop: 10,
      justifyContent: 'center',
    },
    settingsSheetGroupRow: {
      marginTop: 10,
      alignItems: 'center',
      flexDirection: 'row',
    },
  });
}
