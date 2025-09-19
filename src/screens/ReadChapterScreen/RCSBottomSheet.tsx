import {res_get_group_$} from '@api';
import {BottomSheet, Button, Dropdown} from '@components';
import React, {Dispatch, SetStateAction} from 'react';
import {ScrollView, Text, View, Switch, StyleSheet} from 'react-native';
import {useReadChapterScreenContext} from './useReadChapterScreenContext';
import {RootState, useAppSelector} from '@store';
import {ColorScheme, PRETENDARD_JP} from '@constants';
import {textColor, useAppCore} from '@utils';
import Animated, {LinearTransition} from 'react-native-reanimated';

type Props = {
  showBottomSheet: boolean;
  setShowBottomSheet: Dispatch<SetStateAction<boolean>>;
};

export function RCSBottomSheet({showBottomSheet, setShowBottomSheet}: Props) {
  const {colorScheme} = useAppCore();

  const styles = getStyles(colorScheme);

  const {
    navigation,
    chapters,
    currentChapter,
    setCurrentChapter,
    scanlator,
    user,
    readingModes,
    locReadingMode,
    setLocReadingMode,
    setShowBottomOverlay,
    isDataSaver,
    onDataSaverSwitchChange,
  } = useReadChapterScreenContext();

  return (
    <BottomSheet showBottomSheet={showBottomSheet} setShowBottomSheet={setShowBottomSheet}>
      <ScrollView
        contentContainerStyle={styles.settingsSheetScrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <Text style={styles.settingsSheetHeader}>
          {chapters[currentChapter].title ? chapters[currentChapter].title : 'No Chapter Title'}
        </Text>
        <View style={styles.settingsSheetGroup}>
          <Text style={styles.settingsSheetSmall}>
            Chapter {chapters[currentChapter].chapterNumber}
          </Text>
          <Text style={styles.settingsSheetSmall}>{chapters[currentChapter].id}</Text>
          <Text style={styles.settingsSheetSmall}>
            Scanlator: {scanlator?.attributes.name ?? 'No Scanlator'}
          </Text>
          <Text style={styles.settingsSheetSmall}>
            Uploaded by User: {user?.attributes.username ?? 'No User Available'}
          </Text>
        </View>
        <Animated.View layout={LinearTransition} style={styles.settingsSheetGroup}>
          <Text style={styles.settingsSheetSmall}>Reading Mode</Text>
          <Dropdown
            items={readingModes}
            selection={locReadingMode}
            setSelection={setLocReadingMode}
            onSelectionPress={() => {
              console.log('pressed');
              setShowBottomOverlay(false);
            }}
            atLeastOne
          />
        </Animated.View>
        <Animated.View layout={LinearTransition} style={styles.settingsSheetGroup}>
          <Text style={styles.settingsSheetSmall}>Chapter</Text>
          <Dropdown
            items={chapters.map((chapter, index) => {
              return {
                label: 'Chapter ' + chapter.chapterNumber,
                subLabel:
                  (
                    chapter.relationships.find(rs => {
                      if (rs.type === 'scanlation_group') {
                        return rs;
                      }
                    }) as res_get_group_$['data']
                  )?.attributes.name ?? 'no scanlator',
                value: index,
              };
            })}
            selection={currentChapter}
            setSelection={
              setCurrentChapter as React.Dispatch<
                SetStateAction<string | number | Array<string | number>>
              >
            }
            onSelectionPress={() => {
              setShowBottomOverlay(false);
            }}
          />
        </Animated.View>
        <Animated.View layout={LinearTransition} style={styles.settingsSheetGroupRow}>
          <Text style={styles.settingsSheetReg}>Data Saver</Text>
          <Switch value={isDataSaver} onValueChange={onDataSaverSwitchChange} />
        </Animated.View>

        <Animated.View layout={LinearTransition} style={styles.settingsSheetGroupRow}>
          <Button
            title="Go Back"
            onButtonPress={() => {
              navigation.goBack();
            }}
            containerStyle={{marginTop: 20}}
          />
        </Animated.View>
      </ScrollView>
    </BottomSheet>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
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
      paddingTop: 10,
      paddingHorizontal: 15,
      paddingBottom: 60,
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
      marginBottom: 10,
      justifyContent: 'center',
    },
    settingsSheetGroupRow: {
      marginBottom: 10,
      alignItems: 'center',
      flexDirection: 'row',
    },
  });
}
