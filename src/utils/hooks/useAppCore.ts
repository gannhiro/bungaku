import {useInternetConn} from '@utils';
import {RootState, useAppDispatch, useAppSelector} from '@store';
import {AVAILABLE_COLOR_SCHEMES} from '@constants';
import {useMemo} from 'react';

export function useAppCore() {
  const intError = useInternetConn();
  const dispatch = useAppDispatch();
  const preferences = useAppSelector((state: RootState) => state.userPreferences);

  const value = useMemo(() => {
    return {
      intError,
      dispatch,
      preferences: preferences,
      colorScheme: AVAILABLE_COLOR_SCHEMES[preferences.colorSchemeName],
    };
  }, [intError, preferences]);

  return value;
}
