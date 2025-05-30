import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import API_BASE_URL from '../config/apiConfig';

const AddAdminForm = ({ visible, onClose, onAddAdmin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Admin'
  });

  console.log('AddAdminForm rendered. Type of onAddAdmin:', typeof onAddAdmin, '_value:', onAddAdmin);

  const handleAddAdmin = async () => {
    console.log('handleAddAdmin (inside form) called. Type of onAddAdmin:', typeof onAddAdmin, '_value:', onAddAdmin);
    // Basic validation
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (newAdmin.password !== newAdmin.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      // Try endpoint matching your login endpoint pattern but for creating admins
      // This should be updated on the backend to connect to "admins" collection in "Studentlec" database
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: newAdmin.email || '',
          password: newAdmin.password || '',
          name: newAdmin.name || '',
          role: newAdmin.role || 'Admin'
        }),
      });

      // Check content type to ensure we're getting JSON back
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Not JSON, handle as text
        const text = await response.text();
        console.error('Non-JSON response:', text);
        
        // If API endpoint doesn't exist, fall back to local mock data
        if (text.includes('Cannot POST')) {
          console.log('API endpoint not available, using mock data. Backend endpoint needed: /api/auth/admin/register to store in "admins" collection in "Studentlec" database');
          
          const mockData = {
            id: Date.now().toString(),
            name: newAdmin.name,
            email: newAdmin.email,
            role: newAdmin.role
          };
          
          // Reset form
          setNewAdmin({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'Admin'
          });
          
          // Call the onAddAdmin callback with the mock data
          if (typeof onAddAdmin === 'function') {
            onAddAdmin(mockData);
          } else {
            console.error('onAddAdmin prop is not a function after successful API call.', onAddAdmin);
            setError('Internal error: Could not process admin data.');
          }
          if (typeof onClose === 'function') {
            onClose();
          } else {
            console.error('onClose prop is not a function when Cancel is pressed.', onClose);
          }
          return;
        }
        
        setError('Server returned an invalid response. Please try again.');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to add administrator');
        return;
      }

      // Reset form and close modal
      setNewAdmin({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Admin'
      });
      
      // Call the onAddAdmin callback with the new admin data
      if (typeof onAddAdmin === 'function') {
        onAddAdmin(data);
      } else {
        console.error('onAddAdmin prop is not a function after successful API call.', onAddAdmin);
        setError('Internal error: Could not process admin data.');
      }
      if (typeof onClose === 'function') {
        onClose();
      } else {
        console.error('onClose prop is not a function when Cancel is pressed.', onClose);
      }
    } catch (error) {
      console.error('Error adding administrator:', error);
      setError('Network error. Please try again. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.modalContent}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.modalTitle}>Add New Administrator</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={newAdmin.name}
          onChangeText={(text) => setNewAdmin({ ...newAdmin, name: text })}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={newAdmin.email}
          onChangeText={(text) => setNewAdmin({ ...newAdmin, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={newAdmin.password}
          onChangeText={(text) => setNewAdmin({ ...newAdmin, password: text })}
          secureTextEntry
        />
        
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={newAdmin.confirmPassword}
          onChangeText={(text) => setNewAdmin({ ...newAdmin, confirmPassword: text })}
          secureTextEntry
        />
        
        <View style={styles.typeContainer}>
          <Text style={styles.typeLabel}>Admin Role:</Text>
          <TouchableOpacity
            style={[styles.typeButton, newAdmin.role === 'Admin' && styles.selectedType]}
            onPress={() => setNewAdmin({ ...newAdmin, role: 'Admin' })}
          >
            <Text style={[styles.typeButtonText, newAdmin.role === 'Admin' && styles.selectedTypeText]}>Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, newAdmin.role === 'Super Admin' && styles.selectedType]}
            onPress={() => setNewAdmin({ ...newAdmin, role: 'Super Admin' })}
          >
            <Text style={[styles.typeButtonText, newAdmin.role === 'Super Admin' && styles.selectedTypeText]}>Super Admin</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleAddAdmin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add Administrator'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              console.log('Cancel button pressed. Type of onClose:', typeof onClose, '_value:', onClose);
              if (typeof onClose === 'function') {
                onClose();
              } else {
                console.error('onClose prop is not a function when Cancel is pressed.', onClose);
              }
            }}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '100%',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  typeLabel: {
    marginRight: 10,
  },
  typeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
  },
  selectedType: {
    backgroundColor: '#9c9c95',
  },
  typeButtonText: {
    color: '#333',
  },
  selectedTypeText: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#9c9c95',
  },
  cancelButton: {
    backgroundColor: '#000000',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#dc3545',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1B3358',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});

export default AddAdminForm; 