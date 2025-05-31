import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Switch, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import API_BASE_URL from '../config/apiConfig';

const StudentLoginScreen = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useStudentId, setUseStudentId] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();

  const validateFields = () => {
    if (!identifier.trim()) {
      setError(`Please enter your ${useStudentId ? 'Student ID' : 'Email'}`);
      return false;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return false;
    }
    if (useStudentId && !/^\d{8,}$/.test(identifier.trim())) {
      setError('Student ID must be at least 8 digits');
      return false;
    }
    if (!useStudentId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())) {
      setError('Please enter a valid email address');
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
        username: identifier.trim(),
        password: password
      };
      
      console.log('Sending login payload:', loginPayload);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/student/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      });
      
      const data = await response.json();
      
      if (response.ok && data) {
        const studentInfo = data.student || data.user || data;
        
        const studentData = {
          ...studentInfo,
          role: 'student',
          studentId: studentInfo.studentId || studentInfo.student_id || studentInfo.id || identifier,
          name: studentInfo.name || studentInfo.fullName || studentInfo.full_name || '',
          email: studentInfo.email || studentInfo.emailAddress || studentInfo.email_address || identifier,
          username: studentInfo.username || studentInfo.user_name || identifier,
          lastLogin: new Date().toISOString()
        };
        
        if (studentData.studentId) {
          studentData.studentId = String(studentData.studentId);
        }
        
        await AsyncStorage.setItem('userToken', data.token || '');
        await AsyncStorage.setItem('userData', JSON.stringify(studentData));
        
        try {
          router.replace('/(student)/dashboard');
        } catch (navError) {
          console.error('Router navigation error:', navError);
          try {
            navigation.replace('StudentDashboard');
          } catch (error2) {
            console.error('All navigation attempts failed:', error2);
            setError('Login successful, but navigation failed. Please restart the app.');
          }
        }
      } else {
        setError(data?.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again later.');
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
        <Text style={styles.title}>AUTOMATED{'\n'}ATTENDANCE</Text>
        <Text style={styles.subtitle}>RECORD SYSTEM</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.welcomeText}>Welcome Back Student!</Text>
        <Text style={styles.signInText}>Please sign in to continue</Text>

        <View style={styles.loginTypeContainer}>
          <Text style={styles.loginTypeText}>Login with Student ID</Text>
          <Switch
            value={useStudentId}
            onValueChange={(value) => {
              setUseStudentId(value);
              setIdentifier('');
              setError('');
            }}
            trackColor={{ false: '#767577', true: '#4CAF50' }}
            thumbColor={useStudentId ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{useStudentId ? 'STUDENT ID' : 'EMAIL ADDRESS'}</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={useStudentId ? 'Enter your Student ID' : 'Enter your email'}
            value={identifier}
            onChangeText={(text) => {
              setIdentifier(text);
              setError('');
            }}
            keyboardType={useStudentId ? 'numeric' : 'email-address'}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={useStudentId ? 20 : 100}
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
    backgroundColor: '#D3D3D3',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    color: 'BLACK',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    color: 'BLACK',
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
    marginBottom: 20,
  },
  loginTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  loginTypeText: {
    fontSize: 16,
    color: '#333',
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

export default StudentLoginScreen;
