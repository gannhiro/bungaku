import {ColorScheme, OTOMANOPEE} from '@constants';
import {useAppSelector} from '@store';
import {SectionListData, StyleSheet, Text, View} from 'react-native';
import {GroupedJobSection} from './DownloadsScreen';
import {textColor} from '@utils';

type Props = {
  section: SectionListData<GroupedJobSection['data'][0], GroupedJobSection>;
};

export function DownloadsListRenderHeaderItem({section}: Props) {
  const {colorScheme} = useAppSelector(state => state.userPreferences);

  const styles = getStyles(colorScheme);

  return (
    <View style={styles.container}>
      <Text style={styles.mangaTitle}>{section.title}</Text>
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      marginTop: 10,
      marginBottom: 5,
      borderColor: colorScheme.colors.primary,
    },
    mangaTitle: {
      fontFamily: OTOMANOPEE,
      fontSize: 20,
      color: textColor(colorScheme.colors.main),
      textAlign: 'center',
    },
  });
}
