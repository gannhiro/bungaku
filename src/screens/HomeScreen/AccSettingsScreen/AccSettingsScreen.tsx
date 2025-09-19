import {
  APP_NAME,
  APP_VERS,
  ColorScheme,
  OTOMANOPEE,
  PRETENDARD_JP,
  systemGray1,
  systemGray2,
  systemTeal,
  TOP_OVERLAY_HEIGHT,
  useLabels,
} from '@constants';
import {database} from '@db';
import {RootStackParamsList} from '@navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setDataSaverAsync, setPornographyVisAsync} from '@store';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {textColor, useAppCore} from '@utils';
import React, {Fragment, JSX, useCallback, useMemo} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  SectionList,
  SectionListData,
  SectionListRenderItemInfo,
  StyleSheet,
  Switch,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import FS from 'react-native-fs';
import {InAppBrowser, InAppBrowserAndroidOptions} from 'react-native-inappbrowser-reborn';
import {UpdateAppSectionNotif} from '@components';

export type Settings = {
  title: string;
  subtitle?: string;
  data: Array<{
    label: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: JSX.Element;
  }>;
  icon?: JSX.Element;
  type?: SettingsType;
};

type SettingsType = 'page' | 'switch';

export function AccSettingsScreen() {
  const {dispatch, colorScheme, preferences} = useAppCore();
  const navigation = useNavigation<StackNavigationProp<RootStackParamsList, 'HomeNavigator'>>();
  const {preferDataSaver, allowPornography} = preferences;
  const labels = useLabels().homeScreen.accountTab;

  const styles = getStyles(colorScheme);

  const browserSettings: InAppBrowserAndroidOptions = useMemo(
    () => ({
      enableUrlBarHiding: false,
      toolbarColor: colorScheme.colors.primary,
      navigationBarColor: colorScheme.colors.primary,
    }),
    [colorScheme],
  );

  const handleLoginPress = useCallback(() => {
    navigation.navigate('LoginScreen');
  }, [navigation]);

  const accountSettings: Settings['data'] = useMemo(
    () => [
      {
        label: labels.accountSection.loginLabel,
        subtitle: labels.accountSection.loginSubLabel,
        onPress: handleLoginPress,
      },
    ],
    [labels.accountSection.loginLabel, labels.accountSection.loginSubLabel, handleLoginPress],
  );

  const openBungakuPrivacyPolicy = useCallback(async () => {
    await InAppBrowser.open(
      'https://sites.google.com/view/bungaku-privacy-policy/home',
      browserSettings,
    );
  }, [browserSettings]);

  const openMangaDexPrivacyPolicy = useCallback(async () => {
    await InAppBrowser.open('https://forums.mangadex.org/help/privacy-policy/', browserSettings);
  }, [browserSettings]);

  const openMangaDexTerms = useCallback(async () => {
    await InAppBrowser.open('https://forums.mangadex.org/help/terms/', browserSettings);
  }, [browserSettings]);

  const openMangaDexCookies = useCallback(async () => {
    InAppBrowser.open('https://forums.mangadex.org/help/cookies/', browserSettings);
  }, [browserSettings]);

  const privacySettings: Settings['data'] = useMemo(
    () => [
      {
        label: labels.privacySection.bungakuPrivPolicyLabel,
        onPress: openBungakuPrivacyPolicy,
      },
      {
        label: labels.privacySection.mDexPrivPolicyLabel,
        onPress: openMangaDexPrivacyPolicy,
      },
      {
        label: labels.privacySection.mDexTermsLabel,
        onPress: openMangaDexTerms,
      },
      {
        label: labels.privacySection.mDexCookieLabel,
        onPress: openMangaDexCookies,
      },
    ],
    [
      labels.privacySection.bungakuPrivPolicyLabel,
      labels.privacySection.mDexPrivPolicyLabel,
      labels.privacySection.mDexTermsLabel,
      labels.privacySection.mDexCookieLabel,
      openBungakuPrivacyPolicy,
      openMangaDexPrivacyPolicy,
      openMangaDexTerms,
      openMangaDexCookies,
    ],
  );

  const handleDataSaverChange = useCallback(
    (value: boolean) => {
      dispatch(setDataSaverAsync(value));
    },
    [dispatch],
  );

  const handleThemePress = useCallback(() => {
    navigation.navigate('ThemeModal');
  }, [navigation]);

  const appearanceSettings: Settings['data'] = useMemo(
    () => [
      {
        label: labels.appearanceSection.dataSaverLabel,
        subtitle: labels.appearanceSection.dataSaverSubLabel,
        rightComponent: (
          <Switch
            trackColor={{
              true: systemTeal,
              false: systemGray1,
            }}
            thumbColor={colorScheme.colors.secondary}
            value={preferDataSaver}
            onValueChange={handleDataSaverChange}
          />
        ),
      },
      {
        label: labels.appearanceSection.themeLabel,
        subtitle: labels.appearanceSection.themeSubLabel,
        onPress: handleThemePress,
      },
    ],
    [
      labels.appearanceSection.dataSaverLabel,
      labels.appearanceSection.dataSaverSubLabel,
      labels.appearanceSection.themeLabel,
      labels.appearanceSection.themeSubLabel,
      colorScheme.colors.secondary,
      preferDataSaver,
      handleDataSaverChange,
      handleThemePress,
    ],
  );

  const handleLanguagePress = useCallback(() => {
    navigation.navigate('LanguageModal');
  }, [navigation]);

  const languageSettings: Settings['data'] = useMemo(
    () => [
      {
        label: labels.languageSection.interfaceLabel,
        subtitle: labels.languageSection.interfaceSubLabel,
        onPress: handleLanguagePress,
      },
    ],
    [
      labels.languageSection.interfaceLabel,
      labels.languageSection.interfaceSubLabel,
      handleLanguagePress,
    ],
  );

  const handlePornographyAlert = useCallback(() => {
    if (!allowPornography) {
      Alert.alert(
        'Are you 18+?',
        'bungaku will be fetching pornographic material that are not suitable for ages below 18',
        [
          {
            isPreferred: true,
            text: 'Cancel',
            onPress: () => {
              dispatch(setPornographyVisAsync(false));
              AsyncStorage.setItem(
                'settings',
                JSON.stringify({
                  ...preferences,
                  allowPornography: false,
                }),
              );
            },
          },
          {
            text: 'OK',
            onPress: () => {
              dispatch(setPornographyVisAsync(true));
              AsyncStorage.setItem(
                'settings',
                JSON.stringify({
                  ...preferences,
                  allowPornography: true,
                }),
              );
            },
          },
        ],
      );
    }
  }, [allowPornography, dispatch, preferences]);

  const handlePornographyChange = useCallback(
    async (value: boolean) => {
      dispatch(setPornographyVisAsync(value));
      await AsyncStorage.setItem(
        'settings',
        JSON.stringify({...preferences, allowPornography: value}),
      );
    },
    [dispatch, preferences],
  );

  const handleCreditsPress = useCallback(() => {
    navigation.navigate('CreditsScreen');
  }, [navigation]);

  const handleFeedbackPress = useCallback(() => {
    InAppBrowser.open('https://forms.gle/GK6c1xm3QcLaFxMZ9');
  }, []);

  const handleMaxConcurrentDownloadsPress = useCallback(() => {
    navigation.navigate('CreditsScreen');
  }, [navigation]);

  const otherSettings: Settings['data'] = useMemo(
    () => [
      {
        label: labels.otherSection.allowPornLabel,
        rightComponent: (
          <Switch
            trackColor={{
              true: systemTeal,
              false: systemGray1,
            }}
            thumbColor={colorScheme.colors.secondary}
            onTouchStart={handlePornographyAlert}
            value={allowPornography}
            onValueChange={handlePornographyChange}
          />
        ),
        subtitle: labels.otherSection.allowPornSubLabel,
      },
      {
        label: labels.otherSection.maxConcurrentDownloadsLabel,
        subtitle: labels.otherSection.maxConcurrentDownloadsSubLabel,
        onPress: handleMaxConcurrentDownloadsPress,
      },
      {
        label: labels.otherSection.creditsLabel,
        subtitle: labels.otherSection.creditsSubLabel,
        onPress: handleCreditsPress,
      },
      {
        label: labels.otherSection.feedbackLabel,
        subtitle: labels.otherSection.feedbackSubLabel,
        onPress: handleFeedbackPress,
      },
    ],
    [
      labels.otherSection.allowPornLabel,
      labels.otherSection.allowPornSubLabel,
      labels.otherSection.maxConcurrentDownloadsLabel,
      labels.otherSection.maxConcurrentDownloadsSubLabel,
      labels.otherSection.creditsLabel,
      labels.otherSection.creditsSubLabel,
      labels.otherSection.feedbackLabel,
      labels.otherSection.feedbackSubLabel,
      colorScheme.colors.secondary,
      allowPornography,
      handlePornographyAlert,
      handlePornographyChange,
      handleMaxConcurrentDownloadsPress,
      handleCreditsPress,
      handleFeedbackPress,
    ],
  );

  const clearAsyncStorage = useCallback(async () => {
    await AsyncStorage.clear();
  }, []);

  const clearDbQueue = useCallback(async () => {
    database._workQueue._abortPendingWork();
  }, []);

  const logDbQueue = useCallback(async () => {
    console.log(database._workQueue._queue);
  }, []);

  const goToKitchenSink = useCallback(async () => {
    navigation.navigate('KitchenSinkScreen');
  }, [navigation]);

  const deleteCache = useCallback(async () => {
    const directories = await FS.readdir(`${FS.CachesDirectoryPath}`);
    const promises = directories.map(directory => {
      return FS.unlink(`${FS.CachesDirectoryPath}/${directory}`);
    });

    await Promise.allSettled(promises);
    ToastAndroid.show('Deleted cache.', 1000);
  }, []);

  const debugSettings: Settings['data'] = useMemo(
    () => [
      {
        label: 'Clear AsyncStorage',
        onPress: clearAsyncStorage,
      },
      {
        label: 'Clear db queue',
        onPress: clearDbQueue,
      },
      {
        label: ' db qsueue',
        onPress: logDbQueue,
      },
      {
        label: 'Go to kitchen sink',
        onPress: goToKitchenSink,
      },
      {
        label: 'Delete Cache',
        subtitle: 'delete cache',
        onPress: deleteCache,
      },
    ],
    [clearAsyncStorage, clearDbQueue, logDbQueue, goToKitchenSink, deleteCache],
  );

  const settingsSectionList: Settings[] = useMemo(
    () => [
      {
        title: labels.accountSection.headingLabel,
        data: accountSettings,
        icon: <Image source={require('@assets/icons/account.png')} style={styles.icon} />,
      },
      {
        title: labels.privacySection.headingLabel,
        data: privacySettings,
        icon: <Image source={require('@assets/icons/cookie.png')} style={styles.icon} />,
      },
      {
        title: labels.appearanceSection.headingLabel,
        data: appearanceSettings,
        icon: <Image source={require('@assets/icons/compare.png')} style={styles.icon} />,
      },
      {
        title: labels.languageSection.headingLabel,
        data: languageSettings,
        icon: <Image source={require('@assets/icons/earth.png')} style={styles.icon} />,
      },
      {
        title: labels.otherSection.headingLabel,
        data: otherSettings,
        icon: <Image source={require('@assets/icons/cog.png')} style={styles.icon} />,
      },
    ],
    [
      labels,
      accountSettings,
      privacySettings,
      appearanceSettings,
      languageSettings,
      otherSettings,
      styles.icon,
    ],
  );

  if (__DEV__) {
    settingsSectionList.push({
      title: 'Debug',
      data: debugSettings,
      icon: <Image source={require('@assets/icons/cog.png')} style={styles.icon} />,
    });
  }

  function renderItem({item}: SectionListRenderItemInfo<Settings['data'][0]>) {
    const RowContent = (
      <Fragment>
        <View>
          <Text style={styles.sectionLabel}>{item.label}</Text>
          {item.subtitle && <Text style={styles.sectionSubLabel}>{item.subtitle}</Text>}
        </View>
        {item.rightComponent ??
          (item.onPress && (
            <Image source={require('@assets/icons/chevron-right.png')} style={styles.icon} />
          ))}
      </Fragment>
    );

    if (item?.onPress) {
      return (
        <TouchableOpacity onPress={item.onPress} style={styles.section}>
          {RowContent}
        </TouchableOpacity>
      );
    }
    return <View style={styles.section}>{RowContent}</View>;
  }

  function renderHeaderItem({section}: {section: SectionListData<Settings['data'][0], Settings>}) {
    return (
      <View style={styles.sectionHeader}>
        {section.icon ?? null}
        <Text style={styles.sectionHeaderLabel}>{section.title}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollview} contentContainerStyle={styles.scrollviewCont}>
        <UpdateAppSectionNotif />
        <SectionList
          sections={settingsSectionList}
          renderItem={renderItem}
          renderSectionHeader={renderHeaderItem}
          keyExtractor={item => item.label}
        />
        <Text style={styles.versionText}>
          {APP_NAME} version {APP_VERS}
        </Text>
      </ScrollView>
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    versionText: {
      fontFamily: PRETENDARD_JP.THIN,
      fontSize: 11,
      color: textColor(colorScheme.colors.main),
      textAlign: 'center',
      marginTop: 30,
    },
    container: {
      flex: 1,
      alignItems: 'stretch',
      justifyContent: 'center',
      backgroundColor: colorScheme.colors.main,
    },
    scrollview: {
      flex: 1,
    },
    icon: {
      height: 20,
      width: 20,
      tintColor: textColor(colorScheme.colors.main),
      marginRight: 10,
    },
    scrollviewCont: {
      padding: 15,
      paddingTop: TOP_OVERLAY_HEIGHT,
    },
    username: {
      fontSize: 20,
      fontFamily: OTOMANOPEE,
      color: textColor(colorScheme.colors.main),
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 5,
      marginBottom: 10,
      marginTop: 20,
      borderBottomWidth: 1.5,
      borderColor: textColor(colorScheme.colors.main),
    },
    sectionHeaderLabel: {
      fontSize: 20,
      fontFamily: OTOMANOPEE,
      color: textColor(colorScheme.colors.main),
    },
    section: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 10,
      marginLeft: 15,
    },
    sectionLabel: {
      fontSize: 14,
      fontFamily: PRETENDARD_JP.MEDIUM,
      color: textColor(colorScheme.colors.main),
    },
    sectionSubLabel: {
      fontSize: 8,
      fontFamily: PRETENDARD_JP.LIGHT,
      color: textColor(colorScheme.colors.main),
    },
  });
}
