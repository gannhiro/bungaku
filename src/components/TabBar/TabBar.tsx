import React from 'react';
import {StyleSheet, Vibration, View} from 'react-native';
import {MaterialTopTabBarProps} from '@react-navigation/material-top-tabs';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {ColorScheme, PRETENDARD_JP} from '@constants';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {textColor, useAppCore} from '@utils';

enum Tabs {
  HOME = 'HomeScreen',
  SEARCH = 'SearchScreen',
  LIBRARY = 'LibraryScreen',
  DOWNLOADS = 'DownloadsScreen',
  ACCOUNTSETTINGS = 'AccSettingsScreen',
  CHAPTERS = 'MCSChaptersTab',
  DETAILS = 'MCSDetailsTab',
}

export function TabBar({state, navigation, descriptors}: MaterialTopTabBarProps) {
  const {colorScheme} = useAppCore();

  const styles = getStyles(colorScheme);

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const tabLabel = options.title !== undefined ? options.title : route.name;

        const focused = state.index === index;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const bgColorStyle = useAnimatedStyle(() => {
          'worklet';
          return {
            backgroundColor: withTiming(
              focused ? colorScheme.colors.main : colorScheme.colors.secondary,
            ),
          };
        }, [focused, colorScheme.colors.main]);

        const tap = Gesture.Tap()
          .runOnJS(true)
          .onEnd(() => {
            Vibration.vibrate([0, 50], false);
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          });

        return (
          <GestureDetector key={route.name} gesture={tap}>
            <Animated.View style={[styles.tabContainer, bgColorStyle]}>
              <TabBarIcon tabTitle={route.name} />
              <Animated.Text style={[styles.tabContLabel]}>{tabLabel}</Animated.Text>
            </Animated.View>
          </GestureDetector>
        );
      })}
    </View>
  );
}

type TabBarIconProps = {
  tabTitle: string;
};

function TabBarIcon({tabTitle}: TabBarIconProps) {
  const {colorScheme} = useAppCore();

  const styles = getStyles(colorScheme);

  if (tabTitle === Tabs.HOME) {
    return <Animated.Image source={require('@assets/icons/home.png')} style={[styles.icon]} />;
  }

  if (tabTitle === Tabs.SEARCH) {
    return <Animated.Image source={require('@assets/icons/magnify.png')} style={[styles.icon]} />;
  }

  if (tabTitle === Tabs.LIBRARY) {
    return <Animated.Image source={require('@assets/icons/bookshelf.png')} style={[styles.icon]} />;
  }

  if (tabTitle === Tabs.DOWNLOADS) {
    return <Animated.Image source={require('@assets/icons/download.png')} style={[styles.icon]} />;
  }

  if (tabTitle === Tabs.ACCOUNTSETTINGS) {
    return <Animated.Image source={require('@assets/icons/account.png')} style={[styles.icon]} />;
  }

  if (tabTitle === Tabs.CHAPTERS) {
    return <Animated.Image source={require('@assets/icons/bookshelf.png')} style={[styles.icon]} />;
  }

  if (tabTitle === Tabs.DETAILS) {
    return <Animated.Image source={require('@assets/icons/details.png')} style={[styles.icon]} />;
  }

  return null;
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
    },
    pressable: {
      flex: 1,
    },
    tabContainer: {
      paddingBottom: 25,
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderTopWidth: 2,
      borderColor: colorScheme.colors.primary,
    },
    tabContLabel: {
      fontFamily: PRETENDARD_JP.REGULAR,
      color: textColor(colorScheme.colors.main),
      fontSize: 10,
    },
    icon: {
      width: 20,
      height: 20,
      tintColor: textColor(colorScheme.colors.main),
    },
  });
}
