import {res_get_cover_$} from '@api';
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
import {RootState, useAppSelector} from '@store';
import {textColor, useAppCore} from '@utils';
import React, {useEffect, useState} from 'react';
import {Dimensions, Keyboard, StyleSheet, Switch, Text, ToastAndroid, View} from 'react-native';
import FS from 'react-native-fs';
import Animated, {FadeIn, FadeInLeft, FadeOut, LinearTransition} from 'react-native-reanimated';

const {width, height} = Dimensions.get('screen');

type Props = StackScreenProps<RootStackParamsList, 'AddToLibraryModal'>;

export function AddToLibraryModal({route, navigation}: Props) {
  const {manga} = route.params;
  const {colorScheme} = useAppCore();
  const isInLibrary = useAppSelector((state: RootState) => state.libraryList).libraryList.includes(
    manga.id,
  );
  const styles = getStyles(colorScheme);

  const [loading, setIsLoading] = useState(false);
  const [isDataSaver, setIsDataSaver] = useState(false);
  const [stayUpdatedLoc, setStayUpdatedLoc] = useState(true);
  const [targetLanguages, setTargetLanguages] = useState<((Language | string) | null)[]>([
    manga.availableTranslatedLanguages[0],
  ]);

  const availableLangs: GenericDropdownValues = manga.availableTranslatedLanguages.map(lang => {
    return {
      value: lang,
      label: ISO_LANGS[lang as Language].name,
      subLabel: `${ISO_LANGS[lang as Language].name} | ${lang}`,
    };
  });

  function onCancelBtnPress() {
    navigation.goBack();
  }

  async function onStayUpdatedSwitchChange(value: boolean) {
    setStayUpdatedLoc(value);
  }

  async function onIsDataSaverSwitchChange(value: boolean) {
    setIsDataSaver(value);
  }

  async function onAddToLibPress() {
    Keyboard.dismiss();
    setIsLoading(true);
    const directory = `${FS.DocumentDirectoryPath}/manga/${manga.id}`;

    if (!(await FS.exists(directory))) {
      await FS.mkdir(directory);
    }

    const coverItem = manga.relationships.find(rs => rs.type === 'cover_art') as
      | res_get_cover_$['data']
      | undefined;
    const coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverItem?.attributes.fileName}`;

    const {promise} = FS.downloadFile({
      fromUrl: coverUrl,
      toFile: `${directory}/cover.png`,
    });

    await promise;

    await manga.updateLibrarySettings({
      dateAdded: new Date().toISOString(),
      stayUpdated: stayUpdatedLoc,
      stayUpdatedLanguages: targetLanguages as (Language | null)[],
      isDataSaver,
    });

    setIsLoading(false);
    ToastAndroid.show('Added to Library.', ToastAndroid.SHORT);
  }

  async function onRemoveFromLibPress() {
    Keyboard.dismiss();

    const directory = `${FS.DocumentDirectoryPath}/manga/${manga.id}`;
    await FS.unlink(directory);

    await manga.removeFromLibrary();
    ToastAndroid.show('Removed from Library.', ToastAndroid.SHORT);
  }

  async function onUpdateSettingsPress() {
    Keyboard.dismiss();
    await manga.updateLibrarySettings({
      dateAdded: new Date().toISOString(),
      stayUpdated: stayUpdatedLoc,
      stayUpdatedLanguages: targetLanguages as (Language | null)[],
      isDataSaver,
    });
    ToastAndroid.show('Updated Settings.', ToastAndroid.SHORT);
  }

  useEffect(() => {
    (async () => {
      setStayUpdatedLoc(manga.stayUpdated ?? false);
      setIsDataSaver(manga.isDataSaver ?? false);

      setTargetLanguages(
        manga.stayUpdatedLanguages.length > 0
          ? manga.stayUpdatedLanguages
          : [manga.availableTranslatedLanguages[0]],
      );
    })();
  }, [manga]);

  return (
    <Animated.View style={[styles.container]}>
      <BlurView style={styles.blur} blurType={colorScheme.type} blurRadius={3} />
      <Animated.View entering={FadeIn} layout={LinearTransition} style={styles.innerCont}>
        <Text style={styles.addToLibLabel}>Adding To Library</Text>
        <Text style={styles.mangaTitleLabel}>{manga.title.en}</Text>
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
              atLeastOne
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
            disabled={loading}
          />
          {isInLibrary ? (
            <Button
              title="Remove"
              containerStyle={styles.navButtonAdd}
              btnColor={systemPurple}
              imageReq={require('@assets/icons/book-remove.png')}
              onButtonPress={onRemoveFromLibPress}
              disabled={loading}
              loading={loading}
            />
          ) : (
            <Button
              title="Add"
              containerStyle={styles.navButtonAdd}
              btnColor={systemGreen}
              disabled={loading}
              imageReq={require('@assets/icons/book.png')}
              onButtonPress={onAddToLibPress}
              loading={loading}
            />
          )}
        </Animated.View>
        {isInLibrary && (
          <Animated.View
            style={styles.group}
            entering={FadeInLeft.delay(200)}
            exiting={FadeOut}
            layout={LinearTransition}>
            <Button
              title="Update Settings"
              btnColor={systemIndigo}
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
