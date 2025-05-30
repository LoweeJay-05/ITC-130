import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/apiConfig';

export default function WelcomeScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tryLogin = async (endpoint, roleKey, dashboardPath) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email.trim(), password }),
    });
    const data = await response.json();
    if (response.ok && data) {
      const user = data.user || data;
      await AsyncStorage.setItem('userToken', data.token || '');
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      router.replace(dashboardPath);
      return true;
    }
    return false;
  };

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      // Try admin login
      if (await tryLogin('/api/auth/admin/login', 'admin', '/(admin)/dashboard')) return;
      // Try lecturer login
      if (await tryLogin('/api/auth/lecturer/login', 'lecturer', '/(lecturer)/dashboard')) return;
      // Try student login
      if (await tryLogin('/api/auth/student/login', 'student', '/(student)/dashboard')) return;
      setError('Invalid credentials for all roles.');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{`AUTOMATED\nATTENDANCE`}</Text>
        <Text style={styles.subtitle}>PROJECT X </Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#A9A9A9', alignItems: 'center', paddingVertical: 60 },
  title: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 10 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  welcomeText: { fontSize: 28, fontWeight: 'bold', color: '#1B3358', marginBottom: 20 },
  input: { width: 300, height: 50, borderColor: '#aaa', borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, marginBottom: 16, fontSize: 16 },
  button: { width: 300, height: 50, backgroundColor: '#A9A9A9', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  errorText: { color: 'red', marginBottom: 10, textAlign: 'center' },
});
