import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Network from 'expo-network';
import { useRouter } from 'expo-router';
import { testApiConnection, getApiBaseUrl } from '@/src/services/api';
import { API_CONFIG } from '@/src/config/api.config';

export default function DevToolsScreen() {
  const router = useRouter();
  const [deviceIp, setDeviceIp] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<{ success: boolean; url: string; error?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const ip = await Network.getIpAddressAsync();
      setDeviceIp(ip || 'unknown');
      await handleTest();
    })();
  }, []);

  const handleTest = async () => {
    setBusy(true);
    try {
      const res = await testApiConnection();
      setApiStatus(res);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dev Tools</Text>
      <Text style={styles.subtitle}>Static backend configuration</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Device IP</Text>
        <Text style={styles.value}>{deviceIp || 'Unknown'}</Text>
        <Text style={styles.hint}>Current device network IP address.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>API Configuration</Text>
        <Text style={styles.value}>Static Server IP: {API_CONFIG.SERVER_IP}</Text>
        <Text style={styles.value}>Port: {API_CONFIG.PORT}</Text>
        <Text style={styles.value}>Current URL: {getApiBaseUrl()}</Text>
        <Text style={styles.hint}>To change the server IP, update SERVER_IP in src/config/api.config.ts</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>API Connection Test</Text>
        <Text style={styles.value}>Status: {apiStatus ? (apiStatus.success ? 'OK ✅' : 'Fail ❌') : 'Untested'}</Text>
        <Text style={styles.value}>URL: {apiStatus?.url || '-'}</Text>
        {apiStatus?.error ? <Text style={styles.error}>Error: {apiStatus.error}</Text> : null}

        <TouchableOpacity style={[styles.button, busy && styles.buttonDisabled]} disabled={busy} onPress={handleTest}>
          <Text style={styles.buttonText}>Test API Connection</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.navButton]} onPress={() => router.back()}>
        <Text style={styles.navButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    gap: 8,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
  },
  value: {
    fontFamily: 'Menlo',
  },
  hint: {
    color: '#888',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#1f6feb',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  buttonDanger: {
    backgroundColor: '#d32f2f',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  error: {
    color: '#d32f2f',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
  },
  navButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  navButtonText: {
    fontWeight: '600',
  },
});
