import React from 'react';
import {ActivityIndicator, StyleSheet, View, Text} from 'react-native';

export function MangaListFooter() {
  return (
    <View style={styles.container}>
      <ActivityIndicator />
      <Text>loading!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
