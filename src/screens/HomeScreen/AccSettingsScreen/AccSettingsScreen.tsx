import React, {Fragment} from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  SectionList,
  SectionListData,
  SectionListRenderItemInfo,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  APP_BUILD,
  APP_NAME,
  ColorScheme,
  OTOMANOPEE,
  PRETENDARD_JP,
  systemGray1,
  systemGray2,
  systemTeal,
} from '@constants';
import {
  RootState,
  setDataSaver,
  setPornographyVis,
  setReadingMode,
} from '@store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamsList} from '@navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import {textColor} from '@utils';
import {READING_MODES} from '@screens';
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
  const dispatch = useDispatch();
  const preferences = useSelector((state: RootState) => state.userPreferences);
  const {colorScheme, preferDataSaver, pornographyOK, readingMode} =
    useSelector((state: RootState) => state.userPreferences);
  const styles = getStyles(colorScheme);
  const browserSettings: InAppBrowserAndroidOptions = {
    enableUrlBarHiding: false,
    toolbarColor: colorScheme.colors.primary,
    navigationBarColor: colorScheme.colors.primary,
  };

  const accountSettings: Settings['data'] = [
    {
      label: 'Login',
      subtitle: 'Login to your account. NOT AVAILABLE',
      onPress: () => {
        navigation.navigate('LoginScreen');
      },
    },
  ];

  const privacySettings: Settings['data'] = [
    {
      label: 'bungaku Privacy Policy',
      onPress: async () => {
        await InAppBrowser.open(
          'https://sites.google.com/view/bungaku-privacy-policy/home',
          browserSettings,
        );
      },
    },
    {
      label: 'MangaDex Privacy Policy',
      onPress: async () => {
        await InAppBrowser.open(
          'https://forums.mangadex.org/help/privacy-policy/',
          browserSettings,
        );
      },
    },
    {
      label: 'MangaDex Terms and Rules',
      onPress: async () => {
        await InAppBrowser.open(
          'https://forums.mangadex.org/help/terms/',
          browserSettings,
        );
      },
    },
    {
      label: 'MangaDex Cookie Usage',
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
      label: 'Data Saver',
      subtitle: 'Turning off Data Saver fetches higher quality images.',
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
      label: 'Theme',
      subtitle: 'Change how bungaku looks!',
      onPress: () => {
        navigation.navigate('ThemeModal');
      },
    },
  ];

  const languageSettings: Settings['data'] = [
    {
      label: 'Interface Language',
      subtitle:
        'Change the language of the app. (not available yet, default is EN)',
      onPress: () => {},
    },
  ];

  const otherSettings: Settings['data'] = [
    {
      label: 'Allow Pornography',
      rightComponent: (
        <Switch
          trackColor={{
            true: systemTeal,
            false: systemGray1,
          }}
          thumbColor={colorScheme.colors.secondary}
          onTouchStart={() => {
            if (!pornographyOK) {
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
                          pornographyOK: false,
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
          value={pornographyOK}
          onValueChange={async value => {
            dispatch(setPornographyVis(value));
            await AsyncStorage.setItem(
              'settings',
              JSON.stringify({...preferences, pornographyOK: value}),
            );
          }}
        />
      ),
      subtitle: 'Pornographic manga will not appear in Search Tab if disabled.',
    },
    {
      label: 'Credits',
      subtitle: 'List of people that contributed to making this app!',
      onPress: () => {
        navigation.navigate('CreditsScreen');
      },
    },
    {
      label: 'Give Us Feedback!',
      subtitle: 'Tell us what you think!',
      onPress: () => {
        Linking.openURL('https://forms.gle/GK6c1xm3QcLaFxMZ9');
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
  ];

  const settingsSectionList: Settings[] = [
    {
      title: 'Account',
      data: accountSettings,
      icon: (
        <Image
          source={require('@assets/icons/account.png')}
          style={styles.icon}
        />
      ),
    },
    {
      title: 'Privacy',
      data: privacySettings,
      icon: (
        <Image
          source={require('@assets/icons/cookie.png')}
          style={styles.icon}
        />
      ),
    },
    {
      title: 'Appearance',
      data: appearanceSettings,
      icon: (
        <Image
          source={require('@assets/icons/compare.png')}
          style={styles.icon}
        />
      ),
    },
    {
      title: 'Language',
      data: languageSettings,
      icon: (
        <Image
          source={require('@assets/icons/earth.png')}
          style={styles.icon}
        />
      ),
    },
    {
      title: 'Other',
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
      paddingTop: StatusBar.currentHeight && StatusBar.currentHeight + 30,
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
