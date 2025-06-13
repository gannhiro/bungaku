import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {HomeBottomTabsParamsList} from '../HomeNavigator';
import {JobStatus, RootState, useAppSelector} from '@store';
import {ColorScheme} from '@constants';
import {SectionList, SectionListRenderItemInfo, StyleSheet, View} from 'react-native';
import {DownloadsListRenderItem} from './DownloadsListRenderItem';
import {createSelector} from '@reduxjs/toolkit';
import {res_get_manga_$_feed} from '@api';

export interface GroupedJobSection {
  mangaId: string;
  title: string;
  coverFileName?: string;
  // Data now includes jobId, status, and potentially the chapter object
  data: {
    jobId: string;
    status: JobStatus; // Full status object might be useful for renderItem
    chapter?: res_get_manga_$_feed['data'][0]; // Pass chapter info if needed
  }[];
}

type Props = MaterialTopTabScreenProps<HomeBottomTabsParamsList, 'DownloadsScreen', undefined>;

export function DownloadsScreen({}: Props) {
  const {colorScheme} = useAppSelector(state => state.userPreferences);
  const jobs = useAppSelector(selectGroupedJobs);

  const styles = getStyles(colorScheme);

  function renderItem({item}: SectionListRenderItemInfo<GroupedJobSection['data'][0]>) {
    return <DownloadsListRenderItem jobDetails={item} />;
  }

  return (
    <View style={styles.container}>
      <SectionList
        style={styles.downloadsList}
        contentContainerStyle={styles.downloadsListContent}
        sections={jobs}
        renderItem={renderItem}
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
      const coverFileName = manga?.relationships?.find(r => r.type === 'cover_art')?.attributes
        .fileName;

      grouped[mangaId] = {
        mangaId: mangaId,
        title: manga?.attributes?.title?.en ?? mangaId, // Use manga title, fallback to ID
        coverFileName: coverFileName,
        data: [],
      };
    }

    grouped[mangaId].data.push({
      jobId: jobId,
      status: jobStatus,
      chapter: jobStatus.chapter,
    });
  });

  const sectionsArray = Object.values(grouped).sort((a, b) => a.title.localeCompare(b.title));

  sectionsArray.forEach(section => {
    section.data.sort((jobA, jobB) => {
      // Example sort: queued first, then by chapter number if available
      if (jobA.status.status === 'queued' && jobB.status.status !== 'queued') return -1;
      if (jobA.status.status !== 'queued' && jobB.status.status === 'queued') return 1;

      const chapA = parseFloat(jobA.chapter?.attributes?.chapter ?? '0');
      const chapB = parseFloat(jobB.chapter?.attributes?.chapter ?? '0');
      return chapA - chapB; // Ascending chapter order
    });
  });

  return sectionsArray;
});

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {flex: 1},
    downloadsList: {
      width: '100%',
      flex: 1,
    },
    downloadsListContent: {
      paddingTop: 10,
      paddingHorizontal: 10,
    },
  });
}
