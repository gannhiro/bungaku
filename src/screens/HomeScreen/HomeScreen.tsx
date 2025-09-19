import {Button, DevelopersChoice, LibraryUpdates, UpdateAppSectionNotif} from '@components';
import {ColorScheme, PRETENDARD_JP, mangaDexOrange, neko, useLabels} from '@constants';
import {textColor, useAppCore} from '@utils';
import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {HSJumboList} from './HSJumboList/HSJumboList';

export function HomeScreen() {
  const {colorScheme} = useAppCore();
  const labels = useLabels().homeScreen.homeTab;

  const styles = getStyles(colorScheme);

  async function onSupportBtnPress() {
    const url = 'https://namicomi.com/en/org/3Hb7HnWG/mangadex/subscriptions';
    InAppBrowser.open(url);
  }

  async function onNekoBtnPress() {
    const url = 'https://github.com/nekomangaorg/Neko/releases';
    InAppBrowser.open(url);
  }

  return (
    <ScrollView style={styles.container}>
      <HSJumboList />
      <UpdateAppSectionNotif style={styles.updateNotifContainer} />
      <View style={styles.btnGroup}>
        <Button
          title={labels.mDexButtonLabel}
          btnColor={mangaDexOrange}
          imageReq={require('@assets/icons/mangadex.png')}
          containerStyle={styles.supportMDexBtn}
          onButtonPress={onSupportBtnPress}
          imageStyle={styles.adBtnImage}
          fontSize={14}
        />
        <Button
          title={labels.nekoButtonLabel}
          btnColor={neko}
          imageReq={require('@assets/icons/neko.png')}
          containerStyle={styles.supportMDexBtn}
          onButtonPress={onNekoBtnPress}
          imageStyle={styles.adBtnImage}
          fontSize={14}
        />
      </View>
      {/* TODO: <LibraryUpdates /> */}
      <DevelopersChoice />
    </ScrollView>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.colors.main,
    },
    btnGroup: {
      marginBottom: 30,
      marginHorizontal: 15,
    },
    group: {
      marginBottom: 30,
    },
    groupRow: {
      paddingHorizontal: 20,
      marginBottom: 30,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    welcome: {
      color: textColor(colorScheme.colors.main),
      fontFamily: 'OtomanopeeOne-Regular',
      fontSize: 16,
    },
    miniHeading: {
      color: textColor(colorScheme.colors.main),
      fontFamily: PRETENDARD_JP.BOLD,
      fontSize: 12,
      marginBottom: 5,
      marginLeft: 15,
    },
    footer: {
      alignItems: 'center',
    },
    footerText: {},
    supportMDexBtn: {marginTop: 10},
    adBtnImage: {
      width: 25,
      height: 25,
    },
    updateNotifContainer: {
      marginHorizontal: 15,
    },
  });
}
