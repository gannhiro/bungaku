/**
 * @format
 */
import {AppRegistry} from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import 'react-native-gesture-handler';
import App, {backgroundWork} from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
BackgroundFetch.registerHeadlessTask(backgroundWork);
