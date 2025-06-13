import {Button, Dropdown, GenericDropdownValues} from '@components';
import {
  ColorScheme,
  ISO_LANGS,
  Language,
  OTOMANOPEE,
  PRETENDARD_JP,
  systemGreen,
  systemIndigo,
  systemPurple,
  systemRed,
} from '@constants';
import {RootStackParamsList} from '@navigation';
import {BlurView} from '@react-native-community/blur';
import {StackScreenProps} from '@react-navigation/stack';
import {
  addOrRemoveMangaFromLibrary,
  RootState,
  updateDownloadedMangaSettings,
  useAppDispatch,
  useAppSelector,
} from '@store';
import {MangaDetails} from '@types';
import {getDateTodayAtMidnight, textColor} from '@utils';
import React, {useEffect, useState} from 'react';
import {Dimensions, Keyboard, StyleSheet, Switch, Text, TextInput, View} from 'react-native';
import FS from 'react-native-fs';
import Animated, {
  FadeIn,
  FadeInLeft,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const {width, height} = Dimensions.get('screen');

type Props = StackScreenProps<RootStackParamsList, 'AddToLibraryModal'>;

export function AddToLibraryModal({route, navigation}: Props) {
  const {manga, statistics} = route.params;
  const dispatch = useAppDispatch();
  const {colorScheme} = useAppSelector((state: RootState) => state.userPreferences);
  const {libraryList} = useAppSelector((state: RootState) => state.libraryList);
  const inLibrary = libraryList.includes(manga.id);
  const styles = getStyles(colorScheme);

  const [dateError, setDateError] = useState(false);
  const [isDataSaver, setIsDataSaver] = useState(false);
  const [stayUpdatedLoc, setStayUpdatedLoc] = useState(true);
  const [stayUpdatedYrLoc, setStayUpdatedYrLoc] = useState<string>(
    new Date().getUTCFullYear().toString(),
  );
  const [stayUpdatedMoLoc, setStayUpdatedMoLoc] = useState<string>(
    new Date().getUTCMonth() + 1 < 10
      ? `0${new Date().getUTCMonth() + 1}`
      : (new Date().getUTCMonth() + 1).toString(),
  );
  const [stayUpdatedDyLoc, setStayUpdatedDyLoc] = useState<string>(
    new Date().getUTCDate() < 10
      ? `0${new Date().getUTCDate()}`
      : new Date().getUTCDate().toString(),
  );
  const [targetLanguages, setTargetLanguages] = useState<Language[]>([
    manga.attributes.availableTranslatedLanguages[0] as Language,
  ]);

  const availableLangs: GenericDropdownValues = manga.attributes.availableTranslatedLanguages.map(
    lang => {
      return {
        value: lang,
        label: ISO_LANGS[lang as Language].name,
        subLabel: `${ISO_LANGS[lang as Language].name} | ${lang}`,
      };
    },
  );

  const dateTextInputBorderColor = useSharedValue(colorScheme.colors.secondary);
  const dateTextInputStyle = useAnimatedStyle(() => {
    return {
      borderColor: dateTextInputBorderColor.value,
    };
  });

  function onCancelBtnPress() {
    navigation.goBack();
  }

  function onYearChange(text: string) {
    if (!text || isNaN(parseInt(text, 10))) {
      setStayUpdatedYrLoc('');
      return;
    }
    setStayUpdatedYrLoc(text);
  }

  function onMonthChange(text: string) {
    if (!text || isNaN(parseInt(text, 10))) {
      setStayUpdatedMoLoc('');
      return;
    }
    setStayUpdatedMoLoc(text);
  }

  function onMonthBlur() {
    if (parseInt(stayUpdatedMoLoc, 10) < 10) {
      setStayUpdatedMoLoc(`0${parseInt(stayUpdatedMoLoc, 10)}`);
    }
  }

  function onDayChange(text: string) {
    if (!text || isNaN(parseInt(text, 10))) {
      setStayUpdatedDyLoc('');
      return;
    }
    setStayUpdatedDyLoc(text);
  }

  function onDayBlur() {
    if (parseInt(stayUpdatedDyLoc, 10) < 10) {
      setStayUpdatedDyLoc(`0${parseInt(stayUpdatedDyLoc, 10)}`);
    }
  }

  async function onStayUpdatedSwitchChange(value: boolean) {
    setStayUpdatedLoc(value);
  }

  async function onIsDataSaverSwitchChange(value: boolean) {
    setIsDataSaver(value);
  }

  async function onAddToLibPress() {
    Keyboard.dismiss();
    const mangaDetails: MangaDetails = {
      manga,
      statistics,
      dateAdded: getDateTodayAtMidnight(),
      stayUpdated: stayUpdatedLoc,
      stayUpdatedLanguages: targetLanguages,
      isDataSaver,
    };

    dispatch(addOrRemoveMangaFromLibrary(mangaDetails));
  }

  function onUpdateSettingsPress() {
    const mangaDetails: MangaDetails = {
      manga,
      statistics,
      dateAdded: getDateTodayAtMidnight(),
      stayUpdated: stayUpdatedLoc,
      stayUpdatedLanguages: targetLanguages,
      isDataSaver,
    };

    dispatch(updateDownloadedMangaSettings(mangaDetails));
  }

  useEffect(() => {
    (async () => {
      let extractedDetails = '';
      try {
        extractedDetails = await FS.readFile(
          `${FS.DocumentDirectoryPath}/manga/${manga.id}/manga-details.json`,
        );
      } catch (e) {
        console.log('manga-details.json does not exist');
        return;
      }

      const {
        stayUpdated,
        stayUpdatedLanguages,
        isDataSaver: parsedIsDataSaver,
      }: MangaDetails = JSON.parse(extractedDetails);

      const date = new Date();

      setStayUpdatedLoc(stayUpdated);
      setIsDataSaver(parsedIsDataSaver);
      setStayUpdatedDyLoc(
        date.getUTCDate() < 10 ? `0${date.getUTCDate()}` : date.getUTCDate().toString(),
      );
      setStayUpdatedMoLoc(
        date.getUTCMonth() + 1 < 10
          ? `0${date.getUTCMonth() + 1}`
          : (date.getUTCMonth() + 1).toString(),
      );
      setStayUpdatedYrLoc(date.getUTCFullYear().toString());
      setTargetLanguages(stayUpdatedLanguages);
    })();
  }, [manga]);

  useEffect(() => {
    let localDateError = false;

    if (!stayUpdatedYrLoc || parseInt(stayUpdatedYrLoc, 10) < 1900) {
      console.log('year error' + new Date(manga.attributes.createdAt).getUTCFullYear());
      setDateError(true);
      localDateError = true;
    }

    if (
      !stayUpdatedMoLoc ||
      parseInt(stayUpdatedMoLoc, 10) > 12 ||
      parseInt(stayUpdatedMoLoc, 10) <= 0
    ) {
      console.log('month error');
      setDateError(true);
      localDateError = true;
    }

    if (
      !stayUpdatedDyLoc ||
      parseInt(stayUpdatedDyLoc, 10) > 31 ||
      parseInt(stayUpdatedDyLoc, 10) <= 0
    ) {
      console.log('day error');
      setDateError(true);
      localDateError = true;
    }

    if (localDateError) {
      dateTextInputBorderColor.value = withTiming(systemRed);
      return;
    }

    dateTextInputBorderColor.value = withTiming(colorScheme.colors.primary);
    setDateError(false);
  }, [
    colorScheme,
    dateTextInputBorderColor,
    manga,
    stayUpdatedDyLoc,
    stayUpdatedMoLoc,
    stayUpdatedYrLoc,
  ]);

  return (
    <Animated.View style={[styles.container]}>
      <BlurView style={styles.blur} blurType={colorScheme.type} blurRadius={3} />
      <Animated.View entering={FadeIn} layout={LinearTransition} style={styles.innerCont}>
        <Text style={styles.addToLibLabel}>Adding To Library</Text>
        <Text style={styles.mangaTitleLabel}>{manga.attributes.title.en}</Text>
        <View style={styles.groupRow}>
          <Text style={styles.groupRowLabel}>Stay Updated?</Text>
          <Switch value={stayUpdatedLoc} onValueChange={onStayUpdatedSwitchChange} />
        </View>
        <View style={styles.groupRow}>
          <Text style={styles.groupRowLabel}>Download Data Saver Pages?</Text>
          <Switch value={isDataSaver} onValueChange={onIsDataSaverSwitchChange} />
        </View>
        <Animated.View
          entering={FadeInLeft.delay(200)}
          exiting={FadeOut.duration(75)}
          style={styles.group}>
          <Text style={styles.groupRowLabel}>Target Languages</Text>
          <Text style={styles.groupSubLabel}>
            *only chapters with this language will be downloaded.
          </Text>
          <View style={styles.group}>
            <Dropdown
              items={availableLangs}
              selection={targetLanguages}
              setSelection={setTargetLanguages}
            />
          </View>
        </Animated.View>
        <Animated.View layout={LinearTransition} style={styles.groupRow}>
          <Button
            title="Back"
            containerStyle={styles.navButtonCancel}
            btnColor={systemRed}
            onButtonPress={onCancelBtnPress}
            imageReq={require('@assets/icons/chevron-left.png')}
            shouldTintImage={true}
          />
          {inLibrary ? (
            <Button
              title="Remove"
              containerStyle={styles.navButtonAdd}
              btnColor={systemPurple}
              imageReq={require('@assets/icons/book-remove.png')}
              onButtonPress={onAddToLibPress}
            />
          ) : (
            <Button
              title="Add"
              containerStyle={styles.navButtonAdd}
              btnColor={systemGreen}
              disabled={dateError}
              imageReq={require('@assets/icons/book.png')}
              onButtonPress={onAddToLibPress}
            />
          )}
        </Animated.View>
        {inLibrary && (
          <Animated.View
            style={styles.group}
            entering={FadeInLeft.delay(200)}
            exiting={FadeOut}
            layout={LinearTransition}>
            <Button
              title="Update Settings"
              btnColor={systemIndigo}
              disabled={dateError}
              imageReq={require('@assets/icons/book.png')}
              onButtonPress={onUpdateSettingsPress}
            />
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    blur: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
    },
    label: {
      marginBottom: 5,
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
    },
    backBtn: {
      marginTop: 10,
    },
    innerCont: {
      width: width * 0.8,
      maxHeight: height * 0.9,
      backgroundColor: colorScheme.colors.main,
      borderRadius: 20,
      padding: 20,
      elevation: 5,
    },
    addToLibLabel: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.THIN,
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 15,
    },
    mangaTitleLabel: {
      color: textColor(colorScheme.colors.main),
      fontFamily: OTOMANOPEE,
      fontSize: 20,
      textAlign: 'center',
    },
    group: {
      justifyContent: 'center',
      marginTop: 10,
    },
    groupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    groupRowLabel: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 14,
    },
    groupSubLabel: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.LIGHT,
      fontSize: 9,
    },
    dateTextInputsRow: {
      flexDirection: 'row',
      marginTop: 5,
    },
    dateTextInputs: {
      flex: 1,
      backgroundColor: colorScheme.colors.primary,
      padding: 0,
      paddingHorizontal: 5,

      fontFamily: PRETENDARD_JP.REGULAR,
      color: textColor(colorScheme.colors.primary),
      borderRadius: 5,
      textAlign: 'center',

      borderWidth: 2,
    },
    dateTextInputsMid: {
      marginHorizontal: 5,
    },
    navButtonCancel: {
      flex: 1,
      marginRight: 10,
      marginTop: 20,
    },
    navButtonAdd: {
      flex: 1,
      marginTop: 20,
    },
  });
}
