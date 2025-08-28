import React, {JSX, useEffect, useState} from 'react';
import {Dimensions, Image, SafeAreaView, StatusBar, StyleSheet, Text} from 'react-native';
import Animated, {SlideInDown, SlideInUp, SlideOutDown, SlideOutUp} from 'react-native-reanimated';
import {AVAILABLE_COLOR_SCHEMES, ColorScheme, PRETENDARD_JP, systemRed, white} from '@constants';
import {RootState, setError, useAppDispatch, useAppSelector} from '@store';
import {useInternetConn} from '@utils';

type Props = {
  children: JSX.Element[];
};

const {height} = Dimensions.get('window');

export function Overlay({children}: Props) {
  const dispatch = useAppDispatch();
  const colorScheme =
    AVAILABLE_COLOR_SCHEMES[useAppSelector(state => state.userPreferences.colorScheme)];

  const {error} = useAppSelector((state: RootState) => state.error);
  const styles = getStyles(colorScheme);
  const intError = useInternetConn();

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      setTimeout(() => {
        dispatch(setError(null));
      }, 3500);
    } else {
      setShowError(false);
    }
  }, [dispatch, error]);

  return (
    <Animated.View style={styles.container}>
      {children.map(value => value)}
      {intError && (
        <Animated.View
          entering={SlideInUp}
          exiting={SlideOutUp}
          style={[styles.internetErrorOverlay]}>
          <SafeAreaView style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.noInternetLabel}>No Internet</Text>
            <Image source={require('@assets/icons/wifi-off.png')} style={styles.wifiSlashIcon} />
          </SafeAreaView>
        </Animated.View>
      )}
      {error && (
        <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={[styles.errorOverlay]}>
          <Text style={styles.errorTitle}>
            {error.result === 'error' && `${error?.errors[0].status}: ${error?.errors[0].title}`}
            {error.result === 'internal-error' && error.title}
          </Text>
          <Text style={styles.errorDesc}>
            {error.result === 'error' && error.errors[0].detail}
            {error.result === 'internal-error' && error.desc}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

function getStyles(colorScheme: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    internetErrorOverlay: {
      paddingTop: StatusBar.currentHeight ?? 0,
      backgroundColor: systemRed,
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    },
    noInternetLabel: {
      fontFamily: PRETENDARD_JP.REGULAR,
      textAlign: 'center',
      textTransform: 'uppercase',
      fontSize: 10,
      color: white,
    },
    wifiSlashIcon: {
      marginLeft: 3,
      width: 10,
      height: 10,
      tintColor: white,
    },
    errorOverlay: {
      borderRadius: 10,
      padding: 8,
      backgroundColor: colorScheme.colors.main,
      borderWidth: 2,
      borderColor: systemRed,
      elevation: 5,
      position: 'absolute',
      bottom: height * 0.1,
      left: 20,
      right: 20,
    },
    errorTitle: {
      fontFamily: PRETENDARD_JP.BOLD,
      color: systemRed,
      textAlign: 'center',
      textTransform: 'uppercase',
      fontSize: 12,
    },
    errorDesc: {
      fontFamily: PRETENDARD_JP.REGULAR,
      color: systemRed,
      textAlign: 'center',
      fontSize: 11,
    },
  });
}
