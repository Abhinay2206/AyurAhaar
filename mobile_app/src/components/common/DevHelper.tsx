/**
 * Development Helper
 * 
 * This component can be temporarily added to your app during development
 * to help you find the correct IP address for API configuration.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as Network from 'expo-network';
import { API_CONFIG } from '../../config/api.config';

export const DevHelper: React.FC = () => {
  const [deviceIP, setDeviceIP] = useState<string>('Loading...');
  const [networkInfo, setNetworkInfo] = useState<string>('Loading...');

  useEffect(() => {
    getNetworkInfo();
  }, []);

  const getNetworkInfo = async () => {
    try {
      const ip = await Network.getIpAddressAsync();
      setDeviceIP(ip || 'Unknown');
      
      if (ip) {
        const networkPart = ip.substring(0, ip.lastIndexOf('.'));
        setNetworkInfo(`Network: ${networkPart}.x`);
      }
    } catch (error) {
      console.log('Network info error:', error);
      setDeviceIP('Error getting IP');
      setNetworkInfo('Error getting network info');
    }
  };

  const showIPInstructions = () => {
    Alert.alert(
      'Finding Your Development Machine IP',
      `Your device IP: ${deviceIP}\n\nTo find your development machine IP:\n\n` +
      '• Windows: Open Command Prompt, run "ipconfig"\n' +
      '• Mac: Open Terminal, run "ifconfig en0 | grep inet"\n' +
      '• Linux: Run "ip addr show"\n\n' +
      `Update API_CONFIG.DEVELOPMENT_IP in src/config/api.config.ts\n\n` +
      `Current config: ${API_CONFIG.DEVELOPMENT_IP}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={showIPInstructions} style={styles.button}>
        <Text style={styles.title}>🔧 Dev Helper</Text>
        <Text style={styles.text}>Device IP: {deviceIP}</Text>
        <Text style={styles.text}>{networkInfo}</Text>
        <Text style={styles.text}>Config IP: {API_CONFIG.DEVELOPMENT_IP}</Text>
        <Text style={styles.helper}>Tap for IP instructions</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  button: {
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  text: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  },
  helper: {
    color: 'yellow',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 5,
  },
});
