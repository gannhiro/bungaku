import {
  APP_VERS,
  ColorScheme,
  PRETENDARD_JP,
  systemGreenDark,
  systemPurple,
  useLabels,
} from '@constants';
import {GitHubRelease} from '@types';
import {textColor, useAppCore} from '@utils';
import {useCallback, useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, ViewStyle} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import semver from 'semver';

type Props = {
  style?: ViewStyle;
};

export function UpdateAppSectionNotif({style}: Props) {
  const {colorScheme} = useAppCore();
  const labels = useLabels().updateNotification;

  const styles = getStyles(colorScheme);

  const [latestRelease, setLatestRelease] = useState<GitHubRelease>();

  const onPress = useCallback(() => {
    if (latestRelease)
      InAppBrowser.open(
        `https://github.com/gannhiro/bungaku/releases/tag/${latestRelease.tag_name}`,
      );
  }, [latestRelease]);

  useEffect(() => {
    (async () => {
      const releases = await fetch('https://api.github.com/repos/gannhiro/bungaku/releases/latest');
      const releasesJson: GitHubRelease = await releases.json();

      setLatestRelease(releasesJson);
    })();
  }, []);

  if (!latestRelease) return null;
  if (!semver.gt(latestRelease.tag_name, APP_VERS)) return;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.container, style]}>
      <Text style={styles.updateAvailableLabel}>{labels.updateAvailableLabel1 + ' '}</Text>
      <Pressable onPress={onPress}>
        <Text style={styles.updateAvailablePressable}>
          {labels.updateAvailableLabel2.replace('@%', latestRelease.tag_name ?? '')}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      backgroundColor: systemGreenDark,
      paddingVertical: 5,
      paddingHorizontal: 5,
      borderRadius: 5,
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    updateAvailableLabel: {
      color: textColor(systemGreenDark),
      fontFamily: PRETENDARD_JP.REGULAR,
      textAlign: 'center',
      fontSize: 12,
      justifyContent: 'center',
    },
    updateAvailablePressable: {
      color: systemPurple,
      fontFamily: PRETENDARD_JP.BOLD,
      fontSize: 12,
      justifyContent: 'center',
    },
  });
}
