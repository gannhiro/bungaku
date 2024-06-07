import React from 'react';
import {Pressable, Text, StyleSheet} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {useSelector} from 'react-redux';
import {black} from '@constants';
import {RootStackParamsList} from '@navigation';
import {RootState} from '@store';

type Props = StackScreenProps<RootStackParamsList, 'TestScreen'>;

export function TestScreen({navigation}: Props) {
  const appConfig = useSelector((state: RootState) => state.userPreferences);
  const {colorScheme} = appConfig;

  const animatedBgStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(colorScheme.colors.main, {duration: 400}),
    };
  });

  return (
    <Animated.View style={[styles.container, animatedBgStyles]}>
      <Pressable
        onPress={() => {
          navigation.navigate('SearchScreen');
        }}>
        <Text style={{color: black}}>Go to SearchScreen</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          navigation.navigate('LoginScreen');
        }}>
        <Text style={{color: black}}>Go to LoginScreen</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
