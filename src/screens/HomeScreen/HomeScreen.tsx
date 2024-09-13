import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {TabBar} from '@components';
import {AHomeScreen} from './AHomeScreen';
import {LibraryScreen} from './LibraryScreen/LibraryScreen';
import {SearchScreen} from './SearchScreen/SearchScreen';
import {AccSettingsScreen} from './AccSettingsScreen/AccSettingsScreen';
import {useLabels} from '@constants';

export type HomeBottomTabsParamsList = {
  AHomeScreen: undefined;
  SearchScreen: undefined;
  LibraryScreen: undefined;
  AccSettingsScreen: undefined;
};
const BottomTabs = createMaterialTopTabNavigator<HomeBottomTabsParamsList>();

export function HomeScreen() {
  const labels = useLabels();

  return (
    <BottomTabs.Navigator
      tabBarPosition="bottom"
      tabBar={TabBar}
      screenOptions={{lazy: true}}>
      <BottomTabs.Screen
        name="AHomeScreen"
        component={AHomeScreen}
        options={{title: labels.homeScreen.home}}
      />
      <BottomTabs.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{title: labels.homeScreen.search}}
      />
      <BottomTabs.Screen
        name="LibraryScreen"
        component={LibraryScreen}
        options={{title: labels.homeScreen.library}}
      />
      <BottomTabs.Screen
        name="AccSettingsScreen"
        component={AccSettingsScreen}
        options={{title: labels.homeScreen.account}}
      />
    </BottomTabs.Navigator>
  );
}
