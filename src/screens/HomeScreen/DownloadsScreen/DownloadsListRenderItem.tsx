import {ColorScheme} from '@constants';
import {useAppSelector} from '@store';
import {StyleSheet, Text, View} from 'react-native';

type Props = {
  jobId: string;
};

export function DownloadsListRenderItem({jobId}: Props) {
  const {colorScheme} = useAppSelector(state => state.userPreferences);
  const job = useAppSelector(state => state.jobs.jobs[jobId]);

  const styles = getStyles(colorScheme);

  return (
    <View style={styles.container}>
      <Text>
        {jobId} - {job.progress}
      </Text>
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {flex: 1},
  });
}
