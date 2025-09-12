import {ColorScheme, PRETENDARD_JP, systemCyan, systemGreen, systemIndigo} from '@constants';
import {StyleSheet, Text, TouchableOpacity, View, ViewStyle} from 'react-native';
import {GroupedJobSection} from './DownloadsScreen';
import {FlagIcon} from '@components';
import {textColor, useAppCore} from '@utils';
import Color from 'color';
import {useCallback} from 'react';

type Props = {
  jobDetails: GroupedJobSection['data'][0];
  onPress?: () => void;
};

export function DownloadsListRenderItem({jobDetails, onPress}: Props) {
  const {colorScheme} = useAppCore();
  const {status, progress, chapter} = jobDetails;

  const styles = getStyles(colorScheme);

  const jobProgressInPercent = ((progress / chapter.totalPages) * 100).toFixed(0);

  const getBackgroundColor = useCallback((): ViewStyle['backgroundColor'] => {
    if (status === 'queued') return Color.rgb(systemCyan).alpha(0.1).toString();
    if (status === 'active') return Color.rgb(systemIndigo).alpha(0.1).toString();
    if (status === 'succeeded') return Color.rgb(systemGreen).alpha(0.1).toString();
  }, [status]);

  function onPressItem() {
    onPress?.();
  }

  return (
    <TouchableOpacity
      style={[styles.container, {backgroundColor: getBackgroundColor()}]}
      onPress={onPressItem}>
      <View style={styles.leftDetailsPart}>
        <Text style={styles.chapterTitle}>
          {chapter.title ? chapter.title : `Chapter ${chapter.chapterNumber}`}
        </Text>
        <View style={styles.chapterDetailsContainer}>
          {chapter?.translatedLanguage && (
            <FlagIcon language={chapter.translatedLanguage} style={styles.languageIcon} />
          )}
          <Text style={styles.chapterNumber}>Chapter - {chapter.chapterNumber}</Text>
        </View>
      </View>

      <View style={styles.rightPercentagePart}>
        <Text style={styles.chapterTitle}>{jobProgressInPercent}%</Text>
      </View>
    </TouchableOpacity>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      paddingVertical: 5,
      paddingHorizontal: 7,
      marginBottom: 10,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colorScheme.colors.primary,
      flexDirection: 'row',
    },
    leftDetailsPart: {
      flex: 1,
      marginRight: 10,
    },
    rightPercentagePart: {
      justifyContent: 'center',
    },
    chapterDetailsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chapterTitle: {
      fontFamily: PRETENDARD_JP.BLACK,
      fontSize: 14,
      color: textColor(colorScheme.colors.main),
    },
    chapterNumber: {
      fontFamily: PRETENDARD_JP.REGULAR,
      fontSize: 12,
      color: textColor(colorScheme.colors.main),
    },
    languageIcon: {
      marginRight: 5,
      width: 18,
      height: 18,
    },
  });
}
