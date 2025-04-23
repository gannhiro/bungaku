import {
  ColorScheme,
  PRETENDARD_JP,
  TOP_OVERLAY_HEIGHT,
  mangaDexOrange,
} from '@constants';
import {RootState, useAppSelector} from '@store';
import {textColor} from '@utils';
import React from 'react';
import {
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';

const {width} = Dimensions.get('screen');

export function CreditsScreen() {
  const {colorScheme} = useAppSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  async function onSupportBtnPress() {
    const url = 'https://namicomi.com/en/org/3Hb7HnWG/mangadex/subscriptions';
    InAppBrowser.open(url);
  }

  async function onNekoBtnPress() {
    const url = 'https://github.com/nekomangaorg/Neko/releases';
    InAppBrowser.open(url);
  }

  async function onPressMe() {
    const url = 'https://github.com/gannhiro/gannhiro';
    InAppBrowser.open(url);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollview}
        contentContainerStyle={styles.scrollviewCont}>
        <TouchableOpacity style={styles.touchableGroup} onPress={onPressMe}>
          <Image
            source={{
              uri: 'https://avatars.githubusercontent.com/u/59760059?v=4',
            }}
            style={styles.myAvatar}
          />
          <View style={styles.row}>
            <Text style={styles.myLabel}>@gannhiro</Text>
            <Image
              source={require('@assets/icons/github.png')}
              style={styles.myGitIcon}
            />
          </View>
          <Text style={styles.mySubLabel}>Creator of bungaku</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.touchableGroup}>
          <Image
            source={require('@assets/icons/react-native.png')}
            style={styles.mainPics}
            resizeMode="contain"
          />
          <Text style={styles.myLabel}>React Native</Text>
          <Text style={styles.mySubLabel}>made with love!</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.touchableGroup}>
          <Image
            source={require('@assets/icons/mangadex.png')}
            style={styles.mainPics}
            resizeMode="contain"
          />
          <Text style={styles.mySubLabel}>powered by</Text>
          <Text style={styles.myLabel}>
            Manga<Text style={{color: mangaDexOrange}}>Dex</Text> API
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.touchableGroup}>
          <Image
            source={require('@assets/icons/pictogrammers.png')}
            style={styles.tintedMainPics}
            resizeMode="contain"
          />
          <Text style={styles.mySubLabel}>icons from</Text>
          <Text style={styles.myLabel}>Pictogrammers</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'stretch',
    },
    scrollview: {
      flex: 1,
    },
    scrollviewCont: {
      paddingTop: TOP_OVERLAY_HEIGHT + 5,
      alignItems: 'center',
    },
    touchableGroup: {
      alignItems: 'center',
      marginBottom: 20,
    },
    myAvatar: {
      width: width * 0.4,
      height: width * 0.4,
      borderRadius: 100,
      borderWidth: 3,
      borderColor: colorScheme.colors.primary,
      marginBottom: 3,
    },
    mainPics: {
      width: width * 0.4,
      height: width * 0.4,
      marginBottom: 3,
    },
    tintedMainPics: {
      width: width * 0.4,
      height: width * 0.4,
      marginBottom: 5,
      tintColor: textColor(colorScheme.colors.main),
    },
    myLabel: {
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 20,
      color: textColor(colorScheme.colors.main),
    },
    mySubLabel: {
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 14,
      color: textColor(colorScheme.colors.main),
    },
    myGitIcon: {
      width: 20,
      height: 20,
      tintColor: textColor(colorScheme.colors.main),
      marginLeft: 5,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    contributorsGroup: {},
  });
}
