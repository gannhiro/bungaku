import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {HomeBottomTabsParamsList} from '../HomeNavigator';
import {ColorScheme} from '@constants';
import {
  SectionList,
  SectionListData,
  SectionListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';
import {DownloadsListRenderItem} from './DownloadsListRenderItem';
import {DownloadsListRenderHeaderItem} from './DownloadsListRenderHeaderItem';
import {useAppCore} from '@utils';
import {JobPayload} from '@store';
import {useEffect, useState} from 'react';
import {useAppSelector} from '@store';
import {selectJobs} from '@store';

export interface GroupedJobSection {
  mangaId: string;
  title: string;
  data: JobPayload[];
}

type Props = MaterialTopTabScreenProps<HomeBottomTabsParamsList, 'DownloadsScreen', undefined>;

export function DownloadsScreen({}: Props) {
  const {colorScheme} = useAppCore();
  const jobs = useAppSelector(selectJobs);

  const styles = getStyles(colorScheme);
  const [jobSections, setJobSections] = useState<GroupedJobSection[]>([]);

  useEffect(() => {
    const grouped: {[mangaId: string]: GroupedJobSection} = {};
    const jobsArray = Object.values(jobs);

    for (const job of jobsArray) {
      const mangaId = job.manga.id;

      if (!grouped[mangaId]) {
        grouped[mangaId] = {
          mangaId: mangaId,
          title: job.manga.title,
          data: [],
        };
      }

      grouped[mangaId].data.push(job);
    }

    const sectionsArray = Object.values(grouped).sort((a, b) => a.title.localeCompare(b.title));

    sectionsArray.forEach(section => {
      section.data.sort((jobA, jobB) => {
        if (jobA.status === 'queued' && jobB.status !== 'queued') return -1;
        if (jobA.status !== 'queued' && jobB.status === 'queued') return 1;

        return jobB.createdAt - jobA.createdAt;
      });
    });

    setJobSections(sectionsArray);
  }, [jobs]);

  function renderItem({item}: SectionListRenderItemInfo<JobPayload>) {
    return <DownloadsListRenderItem jobDetails={item} />;
  }

  function renderSectionHeader({
    section,
  }: {
    section: SectionListData<JobPayload, GroupedJobSection>;
  }) {
    return <DownloadsListRenderHeaderItem section={section} />;
  }

  return (
    <View style={styles.container}>
      <SectionList
        style={styles.downloadsList}
        contentContainerStyle={styles.downloadsListContent}
        sections={jobSections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.jobId}
        extraData={jobs}
      />
    </View>
  );
}

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
