import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import Header from '../../components/Header';
import {Calendar} from 'react-native-calendars';
import { BASE_URL } from '../../constants/url';
import { GETNETWORK, POSTNETWORK } from '../../utils/Network';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';

const TripAssignment = ({navigation}) => {
  const [tripTime, setTripTime] = useState(new Date());
  const [driverName, setDriverName] = useState('');
  const [distance, setDistance] = useState('');
  const [fuel, setFuel] = useState('');
  const [routeDetails, setRouteDetails] = useState('');
  const [estTime, setEstTime] = useState('');
  const [loadDetails, setLoadDetails] = useState('');
  const [destination, setDestination] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

  // Trip Name Dropdown
  const [tripNameOpen, setTripNameOpen] = useState(false);
  const [tripNameValue, setTripNameValue] = useState(null);
  const [tripNameItems, setTripNameItems] = useState([
    {label: 'Trip A', value: 'Trip A'},
    {label: 'Trip B', value: 'Trip B'},
  ]);

  // Trip Status Dropdown
  const [tripStatusOpen, setTripStatusOpen] = useState(false);
  const [tripStatusValue, setTripStatusValue] = useState(null);
  const [tripStatusItems, setTripStatusItems] = useState([
    {label: 'Scheduled', value: 'Scheduled'},
    {label: 'Completed', value: 'Completed'},
  ]);

  // Vehicle Dropdown
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vehicleValue, setVehicleValue] = useState(null);
  const [vehicleItems, setVehicleItems] = useState([
 
  ]);

  const [tripDate, setTripDate] = useState('');

  const handleDayPress = day => {
    setTripDate(day.dateString);
    setShowCalendar(false);
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Keep the existing time and only update the date portion
      const newDate = new Date(selectedDate);
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());
      setDate(newDate);
      // Show time picker after date is selected
      setShowTimePicker(true);
    }
  };

  // Time Picker Handler
  const onChangeTime = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      // Keep the existing date and only update the time portion
      const newDate = new Date(date);
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
      setDate(newDate);
    }
  };

useEffect(() => {
    // Fetch vehicle data when component mounts
    GetVehicle();
    GetTrip()
  }, []);


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

     const GetTrip = async () => {
        const Url = `${BASE_URL}trips/trip_master/`;
    
        try {
          const response = await GETNETWORK(Url, true);
          console.log('Trip Data:', response.data);
    
          const trips = response.data|| [];
    
          const mappedItems = trips.map(item => ({
            label: item.trip_name,
            value: item.trip_id,
          }));
          setTripNameItems(mappedItems);
    
        } catch (error) {
          console.error('Error fetching trips:', error);
          alert('Failed to fetch trip data. Please try again.');
        }
      }

 // Update path as needed

const handleSubmit = async () => {
  if (!tripNameValue || !vehicleValue || !driverName || !date) {
    Alert.alert('Error', 'Please fill all required fields');
    return;
  }

  try {
    // Format the date for the API
    const formattedDateTime = moment(date).format('YYYY-MM-DDTHH:mm:ss');

    // Prepare the payload
    const tripData = {
      trip_id: tripNameValue,
      thing_id: vehicleValue,
      driver: driverName,
      scheduled_datetime: formattedDateTime,
      estimated_distance: distance ? parseFloat(distance) : 0,
      estimated_fuel: fuel ? parseFloat(fuel) : 0,
      estimated_time: estTime || '00:00:00', // Keep as HH:mm:ss format
      load_details: loadDetails || '',
      // trip_status: tripStatusValue || 'Scheduled',
    };

    console.log('Trip data:', tripData);

    // Make sure BASE_URL doesn't have a trailing slash
    const apiUrl = `${BASE_URL.replace(/\/$/, '')}/trips/trip_assignment/`;

    // Call your POSTNETWORK function
    const response = await POSTNETWORK(
      apiUrl,
      tripData,
      true, // enable token
    );

    // Check if response parsing failed (HTML error page)
    if (typeof response === 'string' && response.startsWith('<!')) {
      throw new Error('Server returned an error page');
    }

    if (!response || response?.error) {
      throw new Error(response?.msg || 'Failed to assign trip');
    }

    Alert.alert('Success', response.msg || 'Trip assigned successfully!');

    // Reset form
    setTripNameValue(null);
    setVehicleValue(null);
    setDriverName('');
    setDistance('');
    setFuel('');
    setEstTime('');
    setLoadDetails('');
    setDate(new Date());
    setTripStatusValue(null);

    return response.trip_assignment_id;
  } catch (error) {
    console.error('Error assigning trip:', error.message || error);
    Alert.alert(
      'Error',
      error.message || 'Failed to assign trip. Please try again.',
    );
    throw error;
  }
};


const [days, setDays] = useState('');
const [hours, setHours] = useState('');



const handleDaysChange = text => {
  const cleanText = text.replace(/[^0-9]/g, '');
  setDays(cleanText);
  calculateTotalTime(cleanText, hours);
};

const handleHoursChange = text => {
  const cleanText = text.replace(/[^0-9]/g, '');
  setHours(cleanText);
  calculateTotalTime(days, cleanText);
};

const calculateTotalTime = (daysValue, hoursValue) => {
  const daysNum = parseInt(daysValue) || 0;
  const hoursNum = parseInt(hoursValue) || 0;

  // Calculate total hours (1 day = 24 hours)
  const totalHours = daysNum * 24 + hoursNum;

  // Format as HH:00:00 (you can modify if you need minutes/seconds)
  const formattedTime = `${String(totalHours).padStart(2, '0')}:00:00`;
  setEstTime(formattedTime);
};


  return (
    <>
      <StatusBar backgroundColor={'#0284c7'} barStyle="light-content" />
      <Header
        title="Trip Assignment"
        onMenuPress={() => navigation.openDrawer()}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          {/* Row: Trip Name & Status */}
          <View style={styles.row}>
            <View style={[styles.inputItem, {zIndex: tripNameOpen ? 1000 : 1}]}>
              <Text style={styles.label}>Trip Name</Text>
              <DropDownPicker
                open={tripNameOpen}
                value={tripNameValue}
                items={tripNameItems}
                setOpen={setTripNameOpen}
                setValue={setTripNameValue}
                setItems={setTripNameItems}
                placeholder="Select Trip"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                searchable={true}
                modalProps={{
                  animationType: 'slide',
                }}
                modalContentContainerStyle={styles.modalContent}
                modalTitle="Select Trip"
                modalTitleStyle={styles.modalTitle}
                onOpen={() => {
                  setTripStatusOpen(false);
                  setVehicleOpen(false);
                }}
              />
            </View>
          </View>

          {/* Row: Date & Time */}
          <View style={styles.row}>
            <View style={styles.inputItem}>
              <Text style={styles.label}>Scheduled Date & Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateButtonText}>
                  {moment(date).format('DD MMM YYYY, hh:mm A')}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  testID="datePicker"
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeDate}
                  {...(Platform.OS === 'android' && {
                    positiveButton: {
                      label: 'OK',
                      textColor: '#0284c7',
                    },
                    negativeButton: {
                      label: 'Cancel',
                      textColor: '#ef4444',
                    },
                  })}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  testID="timePicker"
                  value={date}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeTime}
                  is24Hour={true}
                  {...(Platform.OS === 'android' && {
                    positiveButton: {
                      label: 'OK',
                      textColor: '#0284c7',
                    },
                    negativeButton: {
                      label: 'Cancel',
                      textColor: '#ef4444',
                    },
                  })}
                />
              )}
            </View>
          </View>

          {/* Row: Vehicle & Driver */}
          <View style={styles.row}>
            <View style={[styles.inputItem, {zIndex: vehicleOpen ? 1000 : 1}]}>
              <Text style={styles.label}>Assigned Vehicle</Text>
              <DropDownPicker
                open={vehicleOpen}
                value={vehicleValue}
                items={vehicleItems}
                setOpen={setVehicleOpen}
                setValue={setVehicleValue}
                setItems={setVehicleItems}
                placeholder="Select Vehicle"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                searchable={true}
                modalProps={{
                  animationType: 'slide',
                }}
                modalContentContainerStyle={styles.modalContent}
                modalTitle="Select Vehicle"
                modalTitleStyle={styles.modalTitle}
                onOpen={() => {
                  setTripNameOpen(false);
                  setTripStatusOpen(false);
                }}
              />
            </View>
            <View style={styles.inputItem}>
              <Text style={styles.label}>Assigned Driver</Text>
              <TextInput
                placeholderTextColor={'gray'}
                style={styles.input}
                value={driverName}
                onChangeText={setDriverName}
                placeholder="Enter Driver Name"
              />
            </View>
          </View>

          {/* Row: Distance & Fuel */}
          <View style={styles.row}>
            <View style={styles.inputItem}>
              <Text style={styles.label}>Estimated Distance (km)</Text>
              <TextInput
                style={styles.input}
                value={distance}
                placeholderTextColor={'gray'}
                onChangeText={setDistance}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            <View style={styles.inputItem}>
              <Text style={styles.label}>Estimated Fuel Usage (L)</Text>
              <TextInput
                style={styles.input}
                value={fuel}
                onChangeText={setFuel}
                keyboardType="numeric"
                placeholderTextColor={'gray'}
                placeholder="0"
              />
            </View>
          </View>

          {/* Route Details */}

          <View style={styles.inputItem}>
            <Text style={styles.sectionHeader}>Estimated Duration</Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
              }}>
              {/* Days Input */}
              <View style={{flex: 1, marginRight: 10}}>
                <TextInput
                  placeholder="0"
                  placeholderTextColor={'gray'}
                  value={days}
                  onChangeText={handleDaysChange}
                  style={styles.input}
                  keyboardType="numeric"
                />
                <Text style={{textAlign: 'center', color: 'gray'}}>Days</Text>
              </View>

              {/* Hours Input */}
              <View style={{flex: 1, marginLeft: 10}}>
                <TextInput
                  placeholder="0"
                  placeholderTextColor={'gray'}
                  value={hours}
                  onChangeText={handleHoursChange}
                  style={styles.input}
                  keyboardType="numeric"
                />
                <Text style={{textAlign: 'center', color: 'gray'}}>Hours</Text>
              </View>
            </View>
          </View>

          {/* Load Details */}
          <Text style={styles.sectionHeader}>Load Details</Text>
          <TextInput
            multiline
            numberOfLines={4}
            placeholderTextColor={'gray'}
            value={loadDetails}
            onChangeText={setLoadDetails}
            style={styles.textArea}
            placeholder="Enter load details"
          />

          {/* Calendar Modal */}
          <Modal visible={showCalendar} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.calendarContainer}>
                <Calendar
                  onDayPress={handleDayPress}
                  markedDates={{
                    [tripDate]: {selected: true, selectedColor: '#0284c7'},
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

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Assign Trip</Text>
          </TouchableOpacity>
        </ScrollView>
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
    padding: 20,
    paddingBottom: 30,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputItem: {
    flex: 1,
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    color: 'black',
    height: 45,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderRadius: 6,
    height: 45,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    marginTop: 2,
  },
  dropdownText: {
    fontSize: 14,
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
  dateButton: {
    height: 45,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  dateButtonText: {
    color: '#374151',
  },
  textArea: {
    color:'black',
    height: 100,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 10,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
    color: '#111827',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 10,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#0284c7',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TripAssignment;
