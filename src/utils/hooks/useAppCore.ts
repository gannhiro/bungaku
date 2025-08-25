import {useInternetConn} from '@utils';
import {useAppDispatch, useAppSelector, RootState} from '@store';
import {AVAILABLE_COLOR_SCHEMES, ColorScheme} from '@constants';
import {ThunkDispatch} from 'redux-thunk';
import {AnyAction} from 'redux';
import {RootStackParamsList} from '@navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {Config} from 'config';

export function useAppCore<T extends keyof RootStackParamsList>(): {
  intError: boolean;
  dispatch: ThunkDispatch<RootState, any, AnyAction>;
  colorScheme: ColorScheme;
  navigation: StackNavigationProp<RootStackParamsList, T>;
  preferences: Config;
} {
  const intError = useInternetConn();
  const dispatch = useAppDispatch();
  const preferences = useAppSelector((state: RootState) => state.userPreferences);
  const navigation = useNavigation<StackNavigationProp<RootStackParamsList, T>>();

  return {
    intError,
    dispatch,
    colorScheme: AVAILABLE_COLOR_SCHEMES[preferences.colorScheme],
    navigation,
    preferences,
  };
}
