import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {HomeBottomTabsParamsList} from '../HomeNavigator';
import {useAppSelector} from '@store';
import {ColorScheme} from '@constants';
import {StyleSheet, Text, View} from 'react-native';
import {FlashList, ListRenderItemInfo} from '@shopify/flash-list';
import {DownloadsListRenderItem} from './DownloadsListRenderItem';

type Props = MaterialTopTabScreenProps<HomeBottomTabsParamsList, 'DownloadsScreen', undefined>;

export function DownloadsScreen({}: Props) {
  const {colorScheme} = useAppSelector(state => state.userPreferences);
  const jobs = useAppSelector(state => state.jobs.jobs);

  const styles = getStyles(colorScheme);

  function renderItem({item}: ListRenderItemInfo<string>) {
    return <DownloadsListRenderItem jobId={item} />;
  }

  return (
    <View style={styles.container}>
      <FlashList
        style={styles.downloadsList}
        data={Object.keys(jobs).sort()}
        renderItem={renderItem}
      />
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {flex: 1},
    downloadsList: {
      width: '100%',
      flex: 1,
    },
  });
}
