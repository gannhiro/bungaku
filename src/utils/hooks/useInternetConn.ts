import NetInfo from '@react-native-community/netinfo';
import {useEffect, useState} from 'react';

export function useInternetConn() {
  const [internetError, setInternetError] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setInternetError(!(state.isInternetReachable ?? false));
    });
    return () => unsubscribe();
  }, []);

  return internetError;
}
