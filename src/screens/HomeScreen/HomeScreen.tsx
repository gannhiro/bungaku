import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {TabBar} from '@components';
import {AHomeScreen} from './AHomeScreen';
import {LibraryScreen} from './LibraryScreen/LibraryScreen';
import {SearchScreen} from './SearchScreen/SearchScreen';
import {AccSettingsScreen} from './AccSettingsScreen/AccSettingsScreen';

export type HomeBottomTabsParamsList = {
  AHomeScreen: undefined;
  SearchScreen: undefined;
  LibraryScreen: undefined;
  AccSettingsScreen: undefined;
};
const BottomTabs = createMaterialTopTabNavigator<HomeBottomTabsParamsList>();

export function HomeScreen() {
  return (
    <BottomTabs.Navigator
      tabBarPosition="bottom"
      tabBar={TabBar}
      screenOptions={{lazy: true}}>
      <BottomTabs.Screen
        name="AHomeScreen"
        component={AHomeScreen}
        options={{title: 'Home'}}
      />
      <BottomTabs.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{title: 'Search'}}
      />
      <BottomTabs.Screen
        name="LibraryScreen"
        component={LibraryScreen}
        options={{title: 'Library'}}
      />
      <BottomTabs.Screen
        name="AccSettingsScreen"
        component={AccSettingsScreen}
        options={{title: 'Account'}}
      />
    </BottomTabs.Navigator>
  );
}
