import {ColorScheme} from '@constants';
import {useAppSelector} from '@store';
import {StyleSheet, Text, View} from 'react-native';
import {GroupedJobSection} from './DownloadsScreen';

type Props = {
  jobDetails: GroupedJobSection['data'][0];
};

export function DownloadsListRenderItem({jobDetails}: Props) {
  const {colorScheme} = useAppSelector(state => state.userPreferences);
  const job = useAppSelector(state => state.jobs.jobs[jobDetails.jobId]);

  const styles = getStyles(colorScheme);

  return (
    <View style={styles.container}>
      <Text>
        {job.manga?.attributes.title.en} - {job?.progress}
      </Text>
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {padding: 10, marginBottom: 10, borderWidth: 2, borderRadius: 10},
  });
}
