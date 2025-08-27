import {useInternetConn} from '@utils';
import {useAppDispatch, useAppSelector, RootState} from '@store';
import {AVAILABLE_COLOR_SCHEMES} from '@constants';

import {RootStackParamsList} from '@navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {useMemo} from 'react';

export function useAppCore<T extends keyof RootStackParamsList>() {
  const intError = useInternetConn();
  const dispatch = useAppDispatch();
  const preferences = useAppSelector((state: RootState) => state.userPreferences);
  const navigation = useNavigation<StackNavigationProp<RootStackParamsList, T>>();

  const value = useMemo(() => {
    return {
      intError,
      dispatch,
      colorScheme: AVAILABLE_COLOR_SCHEMES[preferences.colorScheme],
      navigation,
      preferences,
    };
  }, [intError, dispatch, preferences, navigation]);

  return value;
}
