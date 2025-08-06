import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import {Calendar} from 'react-native-calendars';
import Header from '../../components/Header';
import { GETNETWORK } from '../../utils/Network';
import { BASE_URL } from '../../constants/url';

const MaintenanceScheduleScreen = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [comments, setComments] = useState('');

  // Vehicle Dropdown
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vehicleValue, setVehicleValue] = useState(null);
  const [vehicleItems, setVehicleItems] = useState([

  ]);

  // Maintenance Type Dropdown
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [maintenanceValue, setMaintenanceValue] = useState(null);
  const [maintenanceItems, setMaintenanceItems] = useState([

  ]);

  const handleDayPress = day => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
  };


  useFocusEffect(
    useCallback(() => {
      // Reset all form fields
      setSelectedDate('');
      setVehicleValue(null);
      setMaintenanceValue(null);
      setComments('');

      // Fetch data again if needed
      GetVehicle();
      GetMaintenance();

      // Optional cleanup
      return () => {
        // any cleanup if needed
      };
    }, []),
  );


  useEffect(() => {
    GetVehicle()
    GetMaintenance();
  }, []);


    useFocusEffect(
      useCallback(() => {
        // Reset all form fields
        setSelectedDate('');
        setVehicleValue(null);
        setMaintenanceValue(null);
        setComments('');
        // reset the states
        setVehicleItems([]);
        setMaintenanceItems([]);
        // Fetch data again if needed
        
       

    
  
  
        // Optional cleanup
        return () => {
          // any cleanup if needed
        };
      }, []),
    );


const GetMaintenance = () => {
  const Url = `${BASE_URL}maintenance/maintenance_master/`;

  // setLoading(true); // Optional: show a loading indicator

  GETNETWORK(Url, true)
    .then(response => {
      console.log('Maintenance Data:', response.data);
      const mappedItems = response.data.map(item => ({
        label: item.maintenance_name,
        value: item.maintenance_id,
      }));
      setMaintenanceItems(mappedItems);
      // setMaintenanceList(response.data); // Or handle it according to your stater
      // setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching maintenance:', error);
      // setLoading(false);
      alert('Failed to fetch maintenance data. Please try again.');
    });
};

const GetVehicle = async () => {
  const Url = `${BASE_URL}projects/117/things/?page=1&search=`;

  try {
    const response = await GETNETWORK(Url, true);
    console.log('Vehicle Data:', response.data);

    const vehicles = response.data?.things || [];

    const mappedItems = vehicles.map(item => ({
      label: item.thing_name,
      value: item.thing_id,
    }));

    setVehicleItems(mappedItems);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    alert('Failed to fetch vehicle data. Please try again.');
  }
};





  const handleSubmit = () => {
    const maintenanceData = {
      date: selectedDate,
      vehicleId: vehicleValue,
      maintenanceType: maintenanceValue,
      comments,
    };
    console.log('Maintenance scheduled:', maintenanceData);

    // Reset form
    setSelectedDate('');
    setVehicleValue(null);
    setMaintenanceValue(null);
    setComments('');
    Alert.alert('Success', 'Maintenance scheduled successfully!');
  };

  return (
    <>
      <StatusBar backgroundColor={'#0284c7'} barStyle="light-content" />
      <Header
        title="Maintenance Schedule"
        onMenuPress={() => navigation.openDrawer()}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          {/* Date & Vehicle ID Row */}
          <View style={styles.inputRow}>
            {/* Date Button */}
            <View style={styles.inputItem}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowCalendar(true)}>
                <Text style={styles.dateButtonText}>
                  {selectedDate || 'Select Date'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Vehicle Dropdown */}
            <View style={[styles.inputItem, {zIndex: 3000}]}>
              <Text style={styles.label}>Vehicle ID</Text>
              <DropDownPicker
                open={vehicleOpen}
                value={vehicleValue}
                items={vehicleItems}
                searchable={true}
                setOpen={setVehicleOpen}
                setValue={setVehicleValue}
                setItems={setVehicleItems}
                placeholder="Select Vehicle"
                
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>
          </View>

          {/* Maintenance Type Dropdown */}
          <View style={[styles.inputItem, {zIndex: 2000}]}>
            <Text style={styles.label}>Maintenance Type</Text>
            <DropDownPicker
              open={maintenanceOpen}
              value={maintenanceValue}
              items={maintenanceItems}
              setOpen={setMaintenanceOpen}
              setValue={setMaintenanceValue}
              setItems={setMaintenanceItems}
              placeholder="Select Maintenance Type"
              searchable={true}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              zIndex={2000}
              zIndexInverse={2000}
            />
          </View>

          {/* Comments */}
          <View style={styles.inputItem}>
            <Text style={styles.label}>Comments</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholderTextColor={'#9ca3af'}
              placeholder="Enter any additional comments"
              value={comments}
              onChangeText={setComments}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Schedule Maintenance</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Calendar Modal */}
        <Modal visible={showCalendar} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.calendarContainer}>
              <Calendar
                onDayPress={handleDayPress}
                markedDates={{
                  [selectedDate]: {selected: true, selectedColor: '#0284c7'},
                }}
                theme={{
                  todayTextColor: '#0284c7',
                  arrowColor: '#0284c7',
                }}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCalendar(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  inputItem: {
    flex: 1,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    color: '#111827',
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  dateButton: {
    height: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  dateButtonText: {
    color: '#374151',
    fontSize: 15,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    height: 48,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    marginTop: 2,
  },
  dropdownText: {
    fontSize: 15,
    color: '#111827',
  },
  dropdownPlaceholder: {
    color: '#9ca3af',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 16,
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#0284c7',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MaintenanceScheduleScreen;
