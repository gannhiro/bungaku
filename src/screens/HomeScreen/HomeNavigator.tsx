import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {TabBar} from '@components';
import {HomeScreen} from './HomeScreen';
import {LibraryScreen} from './LibraryScreen/LibraryScreen';
import {SearchScreen} from './SearchScreen/SearchScreen';
import {AccSettingsScreen} from './AccSettingsScreen/AccSettingsScreen';
import {useLabels} from '@constants';
import {DownloadsScreen} from './DownloadsScreen/DownloadsScreen';

export type HomeBottomTabsParamsList = {
  HomeScreen: undefined;
  SearchScreen: undefined;
  LibraryScreen: undefined;
  DownloadsScreen: undefined;
  AccSettingsScreen: undefined;
};
const BottomTabs = createMaterialTopTabNavigator<HomeBottomTabsParamsList>();

export function HomeNavigator() {
  const labels = useLabels().homeScreen;

  return (
    <BottomTabs.Navigator tabBarPosition="bottom" tabBar={TabBar} screenOptions={{lazy: true}}>
      <BottomTabs.Screen name="HomeScreen" component={HomeScreen} options={{title: labels.home}} />
      <BottomTabs.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{title: labels.search}}
      />
      <BottomTabs.Screen
        name="LibraryScreen"
        component={LibraryScreen}
        options={{title: labels.library}}
      />
      <BottomTabs.Screen
        name="DownloadsScreen"
        component={DownloadsScreen}
        options={{title: labels.downloads}}
      />
      <BottomTabs.Screen
        name="AccSettingsScreen"
        component={AccSettingsScreen}
        options={{title: labels.account}}
      />
    </BottomTabs.Navigator>
  );
}
