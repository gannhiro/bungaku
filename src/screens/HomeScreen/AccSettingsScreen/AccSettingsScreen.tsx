import {
  APP_BUILD,
  APP_NAME,
  ColorScheme,
  OTOMANOPEE,
  PRETENDARD_JP,
  systemGray1,
  systemGray2,
  systemTeal,
  TOP_OVERLAY_HEIGHT,
  useLabels,
} from '@constants';
import {RootStackParamsList} from '@navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  RootState,
  setDataSaver,
  setPornographyVis,
  useAppDispatch,
  useAppSelector,
} from '@store';
import {textColor} from '@utils';
import React, {Fragment} from 'react';
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
import {
  InAppBrowser,
  InAppBrowserAndroidOptions,
} from 'react-native-inappbrowser-reborn';

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
  const navigation =
    useNavigation<
      StackNavigationProp<RootStackParamsList, 'HomeScreen', undefined>
    >();
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(
    (state: RootState) => state.userPreferences,
  );
  const {colorScheme, preferDataSaver, allowPornography} = useAppSelector(
    (state: RootState) => state.userPreferences,
  );
  const labels = useLabels();
  const styles = getStyles(colorScheme);
  const browserSettings: InAppBrowserAndroidOptions = {
    enableUrlBarHiding: false,
    toolbarColor: colorScheme.colors.primary,
    navigationBarColor: colorScheme.colors.primary,
  };

  const accountSettings: Settings['data'] = [
    {
      label: labels.homeScreen.accountTab.accountSection.loginLabel,
      subtitle: labels.homeScreen.accountTab.accountSection.loginSubLabel,
      onPress: () => {
        navigation.navigate('LoginScreen');
      },
    },
  ];

  const privacySettings: Settings['data'] = [
    {
      label: labels.homeScreen.accountTab.privacySection.bungakuPrivPolicyLabel,
      onPress: async () => {
        await InAppBrowser.open(
          'https://sites.google.com/view/bungaku-privacy-policy/home',
          browserSettings,
        );
      },
    },
    {
      label: labels.homeScreen.accountTab.privacySection.mDexPrivPolicyLabel,
      onPress: async () => {
        await InAppBrowser.open(
          'https://forums.mangadex.org/help/privacy-policy/',
          browserSettings,
        );
      },
    },
    {
      label: labels.homeScreen.accountTab.privacySection.mDexTermsLabel,
      onPress: async () => {
        await InAppBrowser.open(
          'https://forums.mangadex.org/help/terms/',
          browserSettings,
        );
      },
    },
    {
      label: labels.homeScreen.accountTab.privacySection.mDexCookieLabel,
      onPress: async () => {
        InAppBrowser.open(
          'https://forums.mangadex.org/help/cookies/',
          browserSettings,
        );
      },
    },
  ];

  const appearanceSettings: Settings['data'] = [
    {
      label: labels.homeScreen.accountTab.appearanceSection.dataSaverLabel,
      subtitle:
        labels.homeScreen.accountTab.appearanceSection.dataSaverSubLabel,
      rightComponent: (
        <Switch
          trackColor={{
            true: systemTeal,
            false: systemGray1,
          }}
          thumbColor={colorScheme.colors.secondary}
          value={preferDataSaver}
          onValueChange={async value => {
            dispatch(setDataSaver(value));
            await AsyncStorage.setItem(
              'settings',
              JSON.stringify({...preferences, preferDataSaver: value}),
            );
          }}
        />
      ),
    },
    {
      label: labels.homeScreen.accountTab.appearanceSection.themeLabel,
      subtitle: labels.homeScreen.accountTab.appearanceSection.themeSubLabel,
      onPress: () => {
        navigation.navigate('ThemeModal');
      },
    },
  ];

  const languageSettings: Settings['data'] = [
    {
      label: labels.homeScreen.accountTab.languageSection.interfaceLabel,
      subtitle: labels.homeScreen.accountTab.languageSection.interfaceSubLabel,
      onPress: () => {
        navigation.navigate('LanguageModal');
      },
    },
  ];

  const otherSettings: Settings['data'] = [
    {
      label: labels.homeScreen.accountTab.otherSection.allowPornLabel,
      rightComponent: (
        <Switch
          trackColor={{
            true: systemTeal,
            false: systemGray1,
          }}
          thumbColor={colorScheme.colors.secondary}
          onTouchStart={() => {
            if (!allowPornography) {
              Alert.alert(
                'Are you 18+?',
                'bungaku will be fetching pornographic material that are not suitable for ages below 18',
                [
                  {
                    isPreferred: true,
                    text: 'Cancel',
                    onPress: async () => {
                      dispatch(setPornographyVis(false));
                      await AsyncStorage.setItem(
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
                  },
                ],
              );
            }
          }}
          value={allowPornography}
          onValueChange={async value => {
            dispatch(setPornographyVis(value));
            await AsyncStorage.setItem(
              'settings',
              JSON.stringify({...preferences, allowPornography: value}),
            );
          }}
        />
      ),
      subtitle: labels.homeScreen.accountTab.otherSection.allowPornSubLabel,
    },
    {
      label: 'Delete Cache',
      subtitle: 'delete cache',
      onPress: async () => {
        const directories = await FS.readdir(`${FS.CachesDirectoryPath}`);
        const promises = directories.map(directory => {
          return FS.unlink(`${FS.CachesDirectoryPath}/${directory}`);
        });

        await Promise.allSettled(promises);
        ToastAndroid.show('Deleted cache.', 1000);
      },
    },
    {
      label: labels.homeScreen.accountTab.otherSection.creditsLabel,
      subtitle: labels.homeScreen.accountTab.otherSection.creditsSubLabel,
      onPress: () => {
        navigation.navigate('CreditsScreen');
      },
    },
    {
      label: labels.homeScreen.accountTab.otherSection.feedbackLabel,
      subtitle: labels.homeScreen.accountTab.otherSection.feedbackSubLabel,
      onPress: () => {
        InAppBrowser.open('https://forms.gle/GK6c1xm3QcLaFxMZ9');
      },
    },
  ];

  const debugSettings: Settings['data'] = [
    {
      label: 'Clear AsyncStorage',
      onPress: async () => {
        await AsyncStorage.clear();
      },
    },
    {
      label: 'Go to kitchen sink',
      onPress: async () => {
        navigation.navigate('KitchenSinkScreen');
      },
    },
  ];

  const settingsSectionList: Settings[] = [
    {
      title: labels.homeScreen.accountTab.accountSection.headingLabel,
      data: accountSettings,
      icon: (
        <Image
          source={require('@assets/icons/account.png')}
          style={styles.icon}
        />
      ),
    },
    {
      title: labels.homeScreen.accountTab.privacySection.headingLabel,
      data: privacySettings,
      icon: (
        <Image
          source={require('@assets/icons/cookie.png')}
          style={styles.icon}
        />
      ),
    },
    {
      title: labels.homeScreen.accountTab.appearanceSection.headingLabel,
      data: appearanceSettings,
      icon: (
        <Image
          source={require('@assets/icons/compare.png')}
          style={styles.icon}
        />
      ),
    },
    {
      title: labels.homeScreen.accountTab.languageSection.headingLabel,
      data: languageSettings,
      icon: (
        <Image
          source={require('@assets/icons/earth.png')}
          style={styles.icon}
        />
      ),
    },
    {
      title: labels.homeScreen.accountTab.otherSection.headingLabel,
      data: otherSettings,
      icon: (
        <Image source={require('@assets/icons/cog.png')} style={styles.icon} />
      ),
    },
  ];

  if (__DEV__) {
    settingsSectionList.push({
      title: 'Debug',
      data: debugSettings,
      icon: (
        <Image source={require('@assets/icons/cog.png')} style={styles.icon} />
      ),
    });
  }

  function renderItem({item}: SectionListRenderItemInfo<Settings['data'][0]>) {
    if (item?.onPress) {
      return (
        <TouchableOpacity onPress={item.onPress} style={styles.section}>
          <View>
            <Text style={styles.sectionLabel}>{item.label}</Text>
            {item.subtitle && (
              <Text style={styles.sectionSubLabel}>{item.subtitle}</Text>
            )}
          </View>
          {item.rightComponent ?? (
            <Image
              source={require('@assets/icons/chevron-right.png')}
              style={styles.icon}
            />
          )}
        </TouchableOpacity>
      );
    }
    return (
      <Fragment>
        <View style={styles.section}>
          <View>
            <Text style={styles.sectionLabel}>{item.label}</Text>
            {item.subtitle && (
              <Text style={styles.sectionSubLabel}>{item.subtitle}</Text>
            )}
          </View>
          {item.rightComponent}
        </View>
      </Fragment>
    );
  }

  function renderHeaderItem({
    section,
  }: {
    section: SectionListData<Settings['data'][0], Settings>;
  }) {
    return (
      <View style={styles.sectionHeader}>
        {section.icon ?? null}
        <Text style={styles.sectionHeaderLabel}>{section.title}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollview}
        contentContainerStyle={styles.scrollviewCont}>
        <SectionList
          data={settingsSectionList}
          sections={settingsSectionList}
          renderItem={renderItem}
          renderSectionHeader={renderHeaderItem}
        />
        <Text style={styles.buildText}>
          {APP_NAME} build {APP_BUILD}
        </Text>
      </ScrollView>
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    buildText: {
      fontFamily: PRETENDARD_JP.THIN,
      fontSize: 11,
      color: systemGray2,
      textAlign: 'center',
      marginTop: 50,
    },
    container: {
      flex: 1,
      alignItems: 'stretch',
      justifyContent: 'center',
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
