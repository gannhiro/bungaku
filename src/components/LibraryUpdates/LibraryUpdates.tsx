import {ColorScheme} from '@constants';
import {RootStackParamsList} from '@navigation';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootState} from '@store';
import {textColor} from '@utils';
import React, {Fragment} from 'react';
import {Dimensions, View, Text, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

const {width} = Dimensions.get('window');

export function LibraryUpdates() {
  const dispatch = useDispatch();
  const navigation =
    useNavigation<
      StackNavigationProp<RootStackParamsList, 'HomeScreen', undefined>
    >();
  const {colorScheme} = useSelector(
    (state: RootState) => state.userPreferences,
  );
  const styles = getStyles(colorScheme);

  return (
    <View style={styles.container}>
      <Fragment>
        {/* <FlatList /> */}
        <Text style={styles.loginPromptLabel}>
          sorry this actually doesn't work yet :p
        </Text>
      </Fragment>
    </View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      height: (width / 4) * 2 - 25,
    },
    loginPromptLabel: {
      fontSize: 11,
      color: textColor(colorScheme.colors.main),
      marginBottom: 5,
    },
    loginBtn: {},
  });
}
