import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/apiConfig';

const LecturerLoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const navigation = useNavigation();

  const validateFields = () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setError('');
    
    if (!validateFields()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const loginPayload = {
        username: email.trim(),
        password: password
      };
      
      console.log('Attempting login with payload:', loginPayload);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/lecturer/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      });
      
      const data = await response.json();
      
      if (response.ok && data) {
        const lecturerInfo = data.lecturer || data.user || data;
        
        const lecturerData = {
          ...lecturerInfo,
          role: 'lecturer',
          lecturerId: lecturerInfo.lecturerId || lecturerInfo.lecturer_id || lecturerInfo.id || 'LEC-' + Date.now(),
          name: lecturerInfo.name || lecturerInfo.fullName || lecturerInfo.full_name || email.split('@')[0],
          email: lecturerInfo.email || lecturerInfo.emailAddress || lecturerInfo.email_address || email,
          department: lecturerInfo.department || lecturerInfo.dept || 'Not specified',
          lastLogin: new Date().toISOString()
        };
        
        await AsyncStorage.setItem('userToken', data.token || '');
        await AsyncStorage.setItem('userData', JSON.stringify(lecturerData));
        
        try {
          router.replace('/(lecturer)/dashboard');
        } catch (navError) {
          console.error('Router navigation error:', navError);
          try {
            navigation.replace('LecturerDashboard');
          } catch (error2) {
            console.error('All navigation attempts failed:', error2);
            setError('Login successful, but navigation failed. Please restart the app.');
          }
        }
      } else {
        setError(data?.message || 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{`AUTOMATED
ATTENDANCE`}</Text>
        <Text style={styles.subtitle}>RECORD SYSTEM</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.welcomeText}>Hello Lecturer!</Text>
        <Text style={styles.signInText}>Please sign in</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={100}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity 
          onPress={() => router.push('/forgot-password')}
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.signInButton, loading && styles.signInButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.signInButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE4E8',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    color: 'black',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    color: 'black',
    fontSize: 18,
    marginTop: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  signInText: {
    color: '#666',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#F5F6FA',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 10,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPassword: {
    color: '#4CAF50',
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  signInButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LecturerLoginScreen;
