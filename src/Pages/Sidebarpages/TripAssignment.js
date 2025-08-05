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
} from 'react-native';
import React, {useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import Header from '../../components/Header';
import {Calendar} from 'react-native-calendars';
// import DateTimePicker from '@react-native-community/datetimepicker';

const TripAssignment = ({navigation}) => {
  const [tripTime, setTripTime] = useState(new Date());
  const [driverName, setDriverName] = useState('');
  const [distance, setDistance] = useState('');
  const [fuel, setFuel] = useState('');
  const [routeDetails, setRouteDetails] = useState('');
  const [loadDetails, setLoadDetails] = useState('');
  const [destination, setDestination] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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
    {label: 'TRK-001', value: 'TRK-001'},
    {label: 'TRK-002', value: 'TRK-002'},
    {label: 'TRK-003', value: 'TRK-003'},
  ]);

  const [tripDate, setTripDate] = useState('');

  const handleDayPress = day => {
    setTripDate(day.dateString);
    setShowCalendar(false);
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setTripTime(selectedTime);
    }
    setShowTimePicker(false);
  };

  const handleSubmit = () => {
    const tripData = {
      tripName: tripNameValue,
      tripStatus: tripStatusValue,
      tripDate,
      tripTime: tripTime.toLocaleTimeString(),
      vehicleId: vehicleValue,
      driverName,
      destination,
      distance,
      fuel,
      routeDetails,
      loadDetails,
    };
    console.log('Trip Assignment:', tripData);
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
            <View
              style={[styles.inputItem, {zIndex: tripStatusOpen ? 1000 : 1}]}>
              <Text style={styles.label}>Trip Status</Text>
              <DropDownPicker
                open={tripStatusOpen}
                value={tripStatusValue}
                items={tripStatusItems}
                setOpen={setTripStatusOpen}
                setValue={setTripStatusValue}
                setItems={setTripStatusItems}
                placeholder="Select Status"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
       searchable={true}
                modalProps={{
                  animationType: 'slide',
                }}
                modalContentContainerStyle={styles.modalContent}
                modalTitle="Select Status"
                modalTitleStyle={styles.modalTitle}
                onOpen={() => {
                  setTripNameOpen(false);
                  setVehicleOpen(false);
                }}
              />
            </View>
          </View>

          {/* Row: Date & Time */}
          <View style={styles.row}>
            <View style={styles.inputItem}>
              <Text style={styles.label}>Scheduled Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowCalendar(true)}>
                <Text style={styles.dateButtonText}>
                  {tripDate || 'Select Date'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputItem}>
              <Text style={styles.label}>Scheduled Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}>
                <Text style={styles.dateButtonText}>
                  {tripTime.toLocaleTimeString()}
                </Text>
              </TouchableOpacity>
              {/* {showTimePicker && (
                <DateTimePicker
                  mode="time"
                  value={tripTime}
                  onChange={handleTimeChange}
                />
              )} */}
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
          <Text style={styles.sectionHeader}>Route Details</Text>
          <TextInput
            multiline
            placeholderTextColor={'gray'}
            numberOfLines={4}
            value={routeDetails}
            onChangeText={setRouteDetails}
            style={styles.textArea}
            placeholder="Enter route details"
          />

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

          {/* Destination */}
          <Text style={styles.sectionHeader}>Destination</Text>
          <TextInput
            style={styles.input}
            value={destination}
            placeholderTextColor={'gray'}
            onChangeText={setDestination}
            placeholder="Enter destination"
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
