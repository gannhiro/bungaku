import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {HomeBottomTabsParamsList} from '../HomeNavigator';
import {JobStatus, RootState, useAppSelector} from '@store';
import {ColorScheme} from '@constants';
import {
  SectionList,
  SectionListData,
  SectionListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';
import {DownloadsListRenderItem} from './DownloadsListRenderItem';
import {createSelector} from '@reduxjs/toolkit';
import {DownloadsListRenderHeaderItem} from './DownloadsListRenderHeaderItem';
import {useAppCore} from '@utils';

export interface GroupedJobSection {
  mangaId: string;
  title: string;
  data: {
    jobId: string;
    status: JobStatus;
  }[];
}

type Props = MaterialTopTabScreenProps<HomeBottomTabsParamsList, 'DownloadsScreen', undefined>;

export function DownloadsScreen({}: Props) {
  const {colorScheme} = useAppCore();
  const jobs = useAppSelector(selectGroupedJobs);

  const styles = getStyles(colorScheme);

  function renderItem({item}: SectionListRenderItemInfo<GroupedJobSection['data'][0]>) {
    return <DownloadsListRenderItem jobDetails={item} />;
  }

  function renderSectionHeader({
    section,
  }: {
    section: SectionListData<GroupedJobSection['data'][0], GroupedJobSection>;
  }) {
    return <DownloadsListRenderHeaderItem section={section} />;
  }

  return (
    <View style={styles.container}>
      <SectionList
        style={styles.downloadsList}
        contentContainerStyle={styles.downloadsListContent}
        sections={jobs}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
      />
    </View>
  );
}

const selectJobsMap = (state: RootState) => state.jobs.jobs;

const selectGroupedJobs = createSelector([selectJobsMap], (jobs): GroupedJobSection[] => {
  const grouped: {[mangaId: string]: GroupedJobSection} = {};

  Object.entries(jobs).forEach(([jobId, jobStatus]) => {
    const mangaId = jobStatus?.manga?.id ?? '';

    jobStatus.jobType === 'downloadChapter';

    if (!grouped[mangaId]) {
      const manga = jobStatus.manga;

      grouped[mangaId] = {
        mangaId: mangaId,
        title: manga?.title ?? mangaId,
        data: [],
      };
    }

    grouped[mangaId].data.push({
      jobId: jobId,
      status: jobStatus,
    });
  });

  const sectionsArray = Object.values(grouped).sort((a, b) => a.title.localeCompare(b.title));

  sectionsArray.forEach(section => {
    section.data.sort((jobA, jobB) => {
      if (jobA.status.status === 'queued' && jobB.status.status !== 'queued') return -1;
      if (jobA.status.status !== 'queued' && jobB.status.status === 'queued') return 1;

      const chapA = parseFloat(`${jobA.status.chapter?.chapterNumber ?? '0'}`);
      const chapB = parseFloat(`${jobA.status.chapter?.chapterNumber ?? '0'}`);
      return chapA - chapB;
    });
  });

  return sectionsArray;
});

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.colors.main,
    },
    downloadsList: {
      width: '100%',
      flex: 1,
    },
    downloadsListContent: {
      paddingTop: 50,
      paddingBottom: 50,
      paddingHorizontal: 10,
    },
  });
}
