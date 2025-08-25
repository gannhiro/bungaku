import {ColorScheme, PRETENDARD_JP, systemCyan, systemGreen, systemIndigo} from '@constants';
import {useAppSelector} from '@store';
import {StyleSheet, Text, TouchableOpacity, View, ViewStyle} from 'react-native';
import {GroupedJobSection} from './DownloadsScreen';
import {FlagIcon} from '@components';
import {textColor} from '@utils';
import Color from 'color';

type Props = {
  jobDetails: GroupedJobSection['data'][0];
  onPress?: () => void;
};

export function DownloadsListRenderItem({jobDetails, onPress}: Props) {
  const {colorScheme} = useAppSelector(state => state.userPreferences);
  const job = useAppSelector(state => state.jobs.jobs[jobDetails.jobId]);

  const styles = getStyles(colorScheme);

  function getBackgroundColor(): ViewStyle['backgroundColor'] {
    if (job.status === 'queued') return Color.rgb(systemCyan).alpha(0.1).toString();
    if (job.status === 'pending') return Color.rgb(systemIndigo).alpha(0.1).toString();
    if (job.status === 'succeeded') return Color.rgb(systemGreen).alpha(0.1).toString();
  }

  function onPressItem() {
    onPress?.();
  }

  return (
    <TouchableOpacity
      style={[styles.container, {backgroundColor: getBackgroundColor()}]}
      onPress={onPressItem}>
      <View style={styles.leftDetailsPart}>
        <Text style={styles.chapterTitle}>
          {job.chapter?.attributes.title
            ? job.chapter?.attributes.title
            : `Chapter ${job.chapter?.attributes.chapter}`}
        </Text>
        <View style={styles.chapterDetailsContainer}>
          {job.chapter?.attributes.translatedLanguage && (
            <FlagIcon
              language={job.chapter?.attributes.translatedLanguage}
              style={styles.languageIcon}
            />
          )}
          <Text style={styles.chapterNumber}>Chapter - {job.chapter?.attributes.chapter}</Text>
        </View>
      </View>

      <View style={styles.rightPercentagePart}>
        <Text style={styles.chapterTitle}>{((job.progress ?? 0) * 100).toFixed(0)}%</Text>
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
