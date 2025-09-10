import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

interface BackgroundPatternProps {
  color?: string;
  opacity?: number;
}

export function AyurvedaPattern({ color = '#3E8E5A', opacity = 0.05 }: BackgroundPatternProps) {
  return (
    <View style={styles.container}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
        <G opacity={opacity}>
          {/* Leaf pattern */}
          <Path
            d="M50 20 Q70 40 50 80 Q30 40 50 20 Z"
            fill={color}
            transform="translate(50, 50)"
          />
          <Path
            d="M50 20 Q70 40 50 80 Q30 40 50 20 Z"
            fill={color}
            transform="translate(150, 150)"
          />
          <Path
            d="M50 20 Q70 40 50 80 Q30 40 50 20 Z"
            fill={color}
            transform="translate(250, 80)"
          />
          <Path
            d="M50 20 Q70 40 50 80 Q30 40 50 20 Z"
            fill={color}
            transform="translate(350, 200)"
          />
          
          {/* Simple mandala circles */}
          <Circle cx="100" cy="300" r="8" fill={color} />
          <Circle cx="200" cy="50" r="6" fill={color} />
          <Circle cx="300" cy="350" r="10" fill={color} />
          <Circle cx="80" cy="450" r="7" fill={color} />
          <Circle cx="320" cy="120" r="5" fill={color} />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
});
