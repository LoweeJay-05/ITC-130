import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import AddAdminForm from './AddAdminForm';
import AddLecturerForm from './AddLecturerForm';
import API_BASE_URL from '../config/apiConfig';

const AdminDashboard = () => {
  const router = useRouter();
  // Initialize all state
  const [studentData, setStudentData] = useState([]);
  const [adminData, setAdminData] = useState([
    { id: '1', name: 'John Admin', email: 'john@admin.com', role: 'Admin' },
    { id: '2', name: 'Jane Admin', email: 'jane@admin.com', role: 'Admin' },
  ]);
  const [lecturerData, setLecturerData] = useState([
    { id: '1', name: 'Dr. Smith', email: 'smith@lecturer.com', department: 'Computer Science' },
    { id: '2', name: 'Prof. Johnson', email: 'johnson@lecturer.com', department: 'Engineering' },
  ]);
  const [activeTab, setActiveTab] = useState('admin');
  const [modalVisible, setModalVisible] = useState(false);
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [lecturerModalVisible, setLecturerModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newStudent, setNewStudent] = useState({
    id: '',
    name: '',
    email: '',
    yearLevel: '',
    section: '',
    course: '',
    type: 'Regular'
  });

  // Function to handle adding a new admin
  const handleAddAdmin = (newAdmin) => {
    // Add the new admin to the list
    // In a real app, this would be updated from the API response
    setAdminData([...adminData, {
      id: (adminData.length + 1).toString(),
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role
    }]);
  };

  // Function to handle adding a new lecturer
  const handleAddLecturer = (newLecturer) => {
    // Add the new lecturer to the list
    // In a real app, this would be updated from the API response
    setLecturerData([...lecturerData, {
      id: (lecturerData.length + 1).toString(),
      name: newLecturer.name,
      email: newLecturer.email,
      department: newLecturer.department
    }]);
  };

  // Function to add new student
  const handleAddStudent = async () => {
    try {
      // Reset error state and set loading
      setError('');
      setLoading(true);

      // Basic validation to prevent errors
      if (!newStudent.id || !newStudent.name || !newStudent.email) {
        setError('ID Number, Name, and Email are required fields');
        setLoading(false);
        return;
      }
      
      // Format the data according to what your API expects
      const studentPayload = {
        studentId: newStudent.id || '',
        name: newStudent.name || '',
        email: newStudent.email || '',
        year: newStudent.yearLevel || '',
        section: newStudent.section || '',
        course: newStudent.course || '',
        studentType: newStudent.type || 'Regular',
        username: newStudent.email || '', // Using email as username
        password: newStudent.id || '', // Using student ID as default password
      };

      console.log('Sending student data:', JSON.stringify(studentPayload));

      const response = await fetch(`${API_BASE_URL}/api/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentPayload),
      });

      // Check if response has JSON content
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        setError('Server returned an invalid response. Please try again.');
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        console.error('API error:', data);
        setError(data.message || 'Failed to add student');
        setLoading(false);
        return;
      }

      console.log('Student added successfully:', data);

      // Format the returned data to match our table structure
      const formattedStudent = {
        id: data.studentId || newStudent.id || '',
        name: data.name || '',
        email: data.email || '',
        yearLevel: data.year || '',
        section: data.section || '',
        course: data.course || '',
        type: data.studentType || 'Regular'
      };

      // Add the new student to the list
      setStudentData([...studentData, formattedStudent]);
      
      // Reset form and close modal
      setNewStudent({
        id: '',
        name: '',
        email: '',
        yearLevel: '',
        section: '',
        course: '',
        type: 'Regular'
      });
      setStudentModalVisible(false);
    } catch (error) {
      console.error('Error adding student:', error);
      setError('Network error. Please try again: ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  // Load students from MongoDB
  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
    };
    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      if (userData) {
        await fetch(`${API_BASE_URL}/api/auth/admin/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: userData.username,
            role: userData.role
          }),
        });
      }

      // Clear local storage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');

      // Navigate back to login
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/students`);
        const data = await response.json();
        if (response.ok) {
          // Format the data to match our table structure
          const formattedData = data.map(student => ({
            id: student.studentId || '',
            name: student.name || '',
            email: student.email || '',
            yearLevel: student.year || '',
            section: student.section || '',
            course: student.course || '',
            type: student.studentType || 'Regular'
          }));
          setStudentData(formattedData);
        } else {
          console.error('Failed to fetch students:', data);
          setError('Failed to load students');
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Network error while loading students');
      }
    };

    fetchStudents();
  }, []);

  const handleAddButtonPress = () => {
    switch (activeTab) {
      case 'student':
        setStudentModalVisible(true);
        break;
      case 'admin':
        setAdminModalVisible(true);
        break;
      case 'lecturer':
        setLecturerModalVisible(true);
        break;
      default:
        break;
    }
  };

  const filterDataBySearch = (data, query) => {
    if (!query) return data;
    const lowerQuery = query.toLowerCase();
    return data.filter(item => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(lowerQuery)
      )
    );
  };

  const renderTable = (data, columns) => {
    const filteredData = filterDataBySearch(data, searchQuery);
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.tableHeader}>
            {columns.map((column, index) => (
              <Text key={index} style={styles.tableHeaderText}>
                {column.label}
              </Text>
            ))}
          </View>
          <ScrollView>
            {filteredData.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                {columns.map((column, colIndex) => (
                  <Text key={colIndex} style={styles.tableCell}>
                    {item[column.key]}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'student':
        return renderTable(studentData, [
          { key: 'id', label: 'ID Number' },
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'yearLevel', label: 'Year Level' },
          { key: 'section', label: 'Section' },
          { key: 'course', label: 'Course' },
          { key: 'type', label: 'Type' }
        ]);
      case 'admin':
        return renderTable(adminData, [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' }
        ]);
      case 'lecturer':
        return renderTable(lecturerData, [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'department', label: 'Department' }
        ]);
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color="#A9A9A9" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'admin' && styles.activeTab]}
          onPress={() => setActiveTab('admin')}
        >
          <Text style={[styles.tabText, activeTab === 'admin' && styles.activeTabText]}>Admins</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lecturer' && styles.activeTab]}
          onPress={() => setActiveTab('lecturer')}
        >
          <Text style={[styles.tabText, activeTab === 'lecturer' && styles.activeTabText]}>Lecturers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'student' && styles.activeTab]}
          onPress={() => setActiveTab('student')}
        >
          <Text style={[styles.tabText, activeTab === 'student' && styles.activeTabText]}>Students</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddButtonPress}>
        <MaterialIcons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Student Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={studentModalVisible}
        onRequestClose={() => setStudentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Student</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="ID Number"
              value={newStudent.id}
              onChangeText={(text) => setNewStudent({...newStudent, id: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newStudent.name}
              onChangeText={(text) => setNewStudent({...newStudent, name: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newStudent.email}
              onChangeText={(text) => setNewStudent({...newStudent, email: text})}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Year Level"
              value={newStudent.yearLevel}
              onChangeText={(text) => setNewStudent({...newStudent, yearLevel: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Section"
              value={newStudent.section}
              onChangeText={(text) => setNewStudent({...newStudent, section: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Course"
              value={newStudent.course}
              onChangeText={(text) => setNewStudent({...newStudent, course: text})}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setStudentModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddStudent}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Adding...' : 'Add Student'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Admin Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={adminModalVisible}
        onRequestClose={() => setAdminModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Admin</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <AddAdminForm
              onAddAdmin={handleAddAdmin}
              onCancel={() => setAdminModalVisible(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Lecturer Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={lecturerModalVisible}
        onRequestClose={() => setLecturerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AddLecturerForm
              onAddLecturer={handleAddLecturer}
              onCancel={() => setLecturerModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#A9A9A9',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 8,
    borderRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#A9A9A9',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 12,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 100,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    flex: 1,
    color: '#666',
    minWidth: 100,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A9A9A9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    padding: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
  },
});

export default AdminDashboard;
