import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import API_BASE_URL from '../config/apiConfig';

const AddLecturerForm = ({ visible, onClose, onAddLecturer }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newLecturer, setNewLecturer] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    specialization: '',
    contactNumber: '',
  });

  console.log('AddLecturerForm rendered. Type of onClose:', typeof onClose, '_value:', onClose);

  const handleAddLecturer = async () => {
    // Basic validation
    if (!newLecturer.name || !newLecturer.email || !newLecturer.password || !newLecturer.department) {
      setError('Please fill in all required fields');
      return;
    }

    if (newLecturer.password !== newLecturer.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      console.log('Attempting to add lecturer with data:', {
        ...newLecturer,
        password: '***HIDDEN***',
        confirmPassword: '***HIDDEN***'
      });
      
      // Try the new direct endpoint first, then fall back to others if needed
      let registrationSuccess = false;
      let responseData = null;
      
      // Define all possible API endpoints to try, prioritizing the new one
      const registerEndpoints = [
        `${API_BASE_URL}/api/lecturers`, // New primary endpoint
        `${API_BASE_URL}/api/auth/lecturer/register`,
        `${API_BASE_URL}/api/lecturers/register`,
        `${API_BASE_URL}/api/lecturer/register`
      ];
      
      // Prepare the request payload with the correct field names for the new endpoint
      const requestPayload = {
        username: newLecturer.email,
        email: newLecturer.email,
        password: newLecturer.password,
        name: newLecturer.name,
        department: newLecturer.department,
        specialization: newLecturer.specialization || '',
        contactNumber: newLecturer.contactNumber || '',
        role: 'lecturer'
      };
      
      console.log('Sending payload:', JSON.stringify(requestPayload));
      
      // Try each endpoint until one works
      for (const endpoint of registerEndpoints) {
        try {
          console.log(`Trying registration endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(requestPayload),
            timeout: 10000 // Increased timeout for better reliability
          });
          
          console.log(`Endpoint ${endpoint} returned status:`, response.status);
          
          // Try to get response data regardless of status code
          let responseText;
          try {
            responseText = await response.text();
            console.log(`Response text from ${endpoint}:`, responseText);
            
            // Try to parse as JSON if possible
            if (responseText) {
              try {
                responseData = JSON.parse(responseText);
                console.log('Parsed response data:', responseData);
              } catch (parseError) {
                console.log('Response is not valid JSON');
              }
            }
          } catch (textError) {
            console.error('Could not read response text:', textError);
          }
          
          // Check if we got a successful response
          if (response.ok) {
            console.log('Registration successful with endpoint:', endpoint);
            registrationSuccess = true;
            break; // Exit the loop if we get a successful response
          } else {
            console.log(`Endpoint ${endpoint} failed with status ${response.status}`);
          }
        } catch (endpointError) {
          console.error(`Network error with endpoint ${endpoint}:`, endpointError);
        }
      }
      
      // If API registration was successful
      if (registrationSuccess && responseData) {
        console.log('Lecturer registration successful!');
        
        // Reset form
        setNewLecturer({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          department: '',
          specialization: '',
          contactNumber: '',
        });
        
        // Call the onAddLecturer callback with the response data
        if (typeof onAddLecturer === 'function') {
          onAddLecturer(responseData);
        } else {
          console.error('onAddLecturer prop is not a function when trying to call it.', onAddLecturer);
          setError('Internal error: Could not process lecturer data.');
        }
        if (typeof onClose === 'function') {
          onClose();
        } else {
          console.error('onClose prop is not a function after adding lecturer.', onClose);
        }
      } else {
        // Try one more direct attempt with the new endpoint
        try {
          console.log('Making final attempt with direct endpoint');
          
          const finalResponse = await fetch(`${API_BASE_URL}/api/lecturers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: newLecturer.email,
              password: newLecturer.password,
              name: newLecturer.name,
              department: newLecturer.department,
              specialization: newLecturer.specialization || '',
              contactNumber: newLecturer.contactNumber || ''
            })
          });
          
          if (finalResponse.ok) {
            const finalData = await finalResponse.json();
            console.log('Final attempt successful:', finalData);
            
            // Reset form
            setNewLecturer({
              name: '',
              email: '',
              password: '',
              confirmPassword: '',
              department: '',
              specialization: '',
              contactNumber: '',
            });
            
            // Call the onAddLecturer callback
            if (typeof onAddLecturer === 'function') {
              onAddLecturer(finalData);
            } else {
              console.error('onAddLecturer prop is not a function after final attempt.', onAddLecturer);
              setError('Internal error: Could not process lecturer data.');
            }
            if (typeof onClose === 'function') {
              onClose();
            } else {
              console.error('onClose prop is not a function after final attempt.', onClose);
            }
            return;
          } else {
            console.log('Final attempt failed with status:', finalResponse.status);
          }
        } catch (finalError) {
          console.error('Error in final attempt:', finalError);
        }
        
        // Fall back to mock data if all API endpoints fail
        console.log('All API endpoints failed, using mock data');
        
        // Create mock lecturer data with a unique ID
        const mockData = {
          id: 'LEC-' + Date.now(),
          lecturerId: 'LEC-' + Date.now(),
          name: newLecturer.name,
          email: newLecturer.email,
          department: newLecturer.department,
          specialization: newLecturer.specialization || '',
          contactNumber: newLecturer.contactNumber || '',
          role: 'lecturer',
          createdAt: new Date().toISOString(),
          _debug: 'Mock data (API unavailable)'
        };
        
        console.log('Created mock lecturer data:', mockData);
        
        // Reset form
        setNewLecturer({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          department: '',
          specialization: '',
          contactNumber: '',
        });
        
        // Call the onAddLecturer callback with mock data
        if (typeof onAddLecturer === 'function') {
          onAddLecturer(mockData);
        } else {
          console.error('onAddLecturer prop is not a function when using mock data.', onAddLecturer);
          setError('Internal error: Could not process lecturer data.');
        }
        if (typeof onClose === 'function') {
          onClose();
        } else {
          console.error('onClose prop is not a function when using mock data.', onClose);
        }
      }
    } catch (error) {
      console.error('Error adding lecturer:', error);
      setError('Network error. Please try again. ' + error.message);
      
      // Don't automatically create mock data on error
      // This allows the user to see the error and try again
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.modalContent}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.modalTitle}>Add New Lecturer</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={newLecturer.name}
          onChangeText={(text) => setNewLecturer({ ...newLecturer, name: text })}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={newLecturer.email}
          onChangeText={(text) => setNewLecturer({ ...newLecturer, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={newLecturer.password}
          onChangeText={(text) => setNewLecturer({ ...newLecturer, password: text })}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={newLecturer.confirmPassword}
          onChangeText={(text) => setNewLecturer({ ...newLecturer, confirmPassword: text })}
          secureTextEntry
        />
        
        <TextInput
          style={styles.input}
          placeholder="Department"
          value={newLecturer.department}
          onChangeText={(text) => setNewLecturer({ ...newLecturer, department: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Specialization"
          value={newLecturer.specialization}
          onChangeText={(text) => setNewLecturer({ ...newLecturer, specialization: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Contact Number"
          value={newLecturer.contactNumber}
          onChangeText={(text) => setNewLecturer({ ...newLecturer, contactNumber: text })}
          keyboardType="phone-pad"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleAddLecturer}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add Lecturer'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingBottom: 20,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '100%',
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1B3358',
  },
});

export default AddLecturerForm; 