import NetInfo from '@react-native-community/netinfo';
import {useEffect, useState} from 'react';

export function useInternetConn() {
  const [internetError, setInternetError] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isInternetReachable) {
        setInternetError(false);
      } else {
        setInternetError(true);
      }
    });
    return () => unsubscribe();
  }, []);

  return internetError;
}
