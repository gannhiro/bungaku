import {Button, Dropdown, GenericDropdownValues} from '@components';
import {
  AVAILABLE_COLOR_SCHEMES,
  ColorScheme,
  TOP_OVERLAY_HEIGHT,
} from '@constants';
import {RootState, setColorScheme, setPreferSystemColor} from '@store';
import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import Animated, {LinearTransition} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';

export function KitchenSinkScreen() {
  const dispatch = useDispatch();
  const {colorScheme, preferSystemColor} = useSelector(
    (state: RootState) => state.userPreferences,
  );

  const colorSchemeChoices: GenericDropdownValues = AVAILABLE_COLOR_SCHEMES.map(
    scheme => {
      return {
        label: scheme.name,
        value: scheme.name,
      };
    },
  );

  const styles = getStyles();

  const [locColorScheme, setLocColorScheme] = useState<ColorScheme['name']>(
    colorScheme.name,
  );

  useEffect(() => {
    const locScheme = AVAILABLE_COLOR_SCHEMES.find(scheme => {
      return scheme.name === locColorScheme;
    });

    if (preferSystemColor) {
      dispatch(setPreferSystemColor(false));
      return;
    }

    if (locScheme) {
      dispatch(setColorScheme(locScheme));
    }
  }, [dispatch, locColorScheme, preferSystemColor]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView} nestedScrollEnabled>
        <Dropdown
          items={colorSchemeChoices}
          selection={locColorScheme}
          setSelection={setLocColorScheme}
          atLeastOne
        />
        <Animated.View style={styles.group} layout={LinearTransition}>
          <Button title="Normal Button" />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function getStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'stretch',
      justifyContent: 'center',
      paddingTop: TOP_OVERLAY_HEIGHT,
    },
    scrollView: {
      alignItems: 'stretch',
      paddingHorizontal: 25,
      flexGrow: 1,
    },
    group: {
      marginVertical: 10,
    },
  });
}
