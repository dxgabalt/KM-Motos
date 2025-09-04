import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'react-native';

interface LogoProps {
  width?: number;
  height?: number;
  style?: any;
}

export function Logo({ width = 120, height = 40, style }: LogoProps) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: 'https://www.kmmotos.com/cdn/shop/files/Logo-1.png?v=1696955196&width=500' }}
        style={[styles.logo, { width, height }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    backgroundColor: 'transparent',
  },
});
