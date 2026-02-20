import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import Header from '../../components/Header';
import { Calendar } from 'react-native-calendars';
import { useStatusBarHeight } from '../../constants/config';
import { BASE_URL } from '../../constants/url';
import { GETNETWORK, POSTNETWORK } from '../../utils/Network';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { Loader } from '../../components/Loader';
import Toast from 'react-native-toast-message';
import { Icon } from '@rneui/themed';

const TripAssignment = ({ navigation }) => {
  const statusBarHeight = useStatusBarHeight();
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
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown states
  const [tripNameOpen, setTripNameOpen] = useState(false);
  const [tripNameValue, setTripNameValue] = useState(null);
  const [tripNameItems, setTripNameItems] = useState([]);

  const [tripStatusOpen, setTripStatusOpen] = useState(false);
  const [tripStatusValue, setTripStatusValue] = useState(null);
  const [tripStatusItems, setTripStatusItems] = useState([
    { label: 'Scheduled', value: 'Scheduled' },
    { label: 'Completed', value: 'Completed' },
  ]);

  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vehicleValue, setVehicleValue] = useState(null);
  const [vehicleItems, setVehicleItems] = useState([]);

  const [driverOpen, setDriverOpen] = useState(false);
  const [driverValue, setDriverValue] = useState(null);
  const [driverItems, setDriverItems] = useState([]);

  const [tripDate, setTripDate] = useState('');
  const [days, setDays] = useState('');
  const [hours, setHours] = useState('');

  // Validation errors state
  const [errors, setErrors] = useState({
    tripName: '',
    vehicle: '',
    driver: '',
    date: '',
    distance: '',
    fuel: '',
    days: '',
    hours: '',
    general: '',
  });

  const zIndexCounter = useRef(1000);

  // Toast configuration
  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
      position: 'top',
      visibilityTime: type === 'error' ? 4000 : 3000,
      autoHide: true,
      topOffset: statusBarHeight,
    });
  };

  // Clear specific error
  const clearError = (fieldName) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: '',
    }));
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {
      tripName: '',
      vehicle: '',
      driver: '',
      date: '',
      distance: '',
      fuel: '',
      days: '',
      hours: '',
      general: '',
    };

    let isValid = true;

    if (!tripNameValue) {
      newErrors.tripName = 'Trip name is required';
      isValid = false;
    }

    if (!vehicleValue) {
      newErrors.vehicle = 'Vehicle selection is required';
      isValid = false;
    }

    if (!driverValue) {
      newErrors.driver = 'Driver selection is required';
      isValid = false;
    }

    if (!date || isNaN(date.getTime())) {
      newErrors.date = 'Valid date and time are required';
      isValid = false;
    } else if (moment(date).isBefore(moment())) {
      newErrors.date = 'Please select a future date and time';
      isValid = false;
    }

    if (distance && isNaN(distance)) {
      newErrors.distance = 'Distance must be a number';
      isValid = false;
    }

    if (fuel && isNaN(fuel)) {
      newErrors.fuel = 'Fuel must be a number';
      isValid = false;
    }

    if (days && (isNaN(days) || parseInt(days) < 0)) {
      newErrors.days = 'Days must be a positive number';
      isValid = false;
    }

    if (hours && (isNaN(hours) || parseInt(hours) < 0 || parseInt(hours) > 23)) {
      newErrors.hours = 'Hours must be between 0-23';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleDayPress = (day) => {
    setTripDate(day.dateString);
    setShowCalendar(false);
    clearError('date');
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());

      if (moment(newDate).isBefore(moment())) {
        showToast('error', 'Invalid Date', 'Please select a future date');
        return;
      }

      setDate(newDate);
      clearError('date');
      setShowTimePicker(true);
      showToast('success', 'Date Selected', moment(newDate).format('DD MMM YYYY'));
    }
  };

  const onChangeTime = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());

      if (moment(newDate).isBefore(moment())) {
        showToast('error', 'Invalid Time', 'Please select a future time');
        return;
      }

      setDate(newDate);
      clearError('date');
      showToast('success', 'Time Selected', moment(newDate).format('hh:mm A'));
    }
  };

  const GetVehicle = async () => {
    setLoading(true);
    const Url = `${BASE_URL}projects/117/things/?page=1&search=`;

    try {
      const response = await GETNETWORK(Url, true);
      const vehicles = response.data?.things || [];
      const mappedItems = vehicles.map((item) => ({
        label: item.thing_name,
        value: item.thing_id,
      }));
      setVehicleItems(mappedItems);
      showToast('success', 'Vehicles Loaded', `${vehicles.length} vehicles loaded`);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      showToast('error', 'Data Error', 'Failed to fetch vehicle data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const GetTrip = async () => {
    setLoading(true);
    const Url = `${BASE_URL}trips/trip_master/`;

    try {
      const response = await GETNETWORK(Url, true);
      const trips = response.data || [];
      const mappedItems = trips.map((item) => ({
        label: item.trip_name,
        value: item.trip_id,
      }));
      setTripNameItems(mappedItems);
      showToast('success', 'Trips Loaded', `${trips.length} trips loaded`);
    } catch (error) {
      console.error('Error fetching trips:', error);
      showToast('error', 'Data Error', 'Failed to fetch trip data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const GetDrivers = async () => {
    setLoading(true);
    const Url = `${BASE_URL}trips/driver_master/`;

    try {
      const response = await GETNETWORK(Url, true);
      const drivers = response.data || [];
      const mappedItems = drivers.map((item) => ({
        label: item.driver_name,
        value: item.driver_master_id,
      }));
      setDriverItems(mappedItems);
      showToast('success', 'Drivers Loaded', `${drivers.length} drivers loaded`);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      showToast('error', 'Data Error', 'Failed to fetch driver data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({
      tripName: '',
      vehicle: '',
      driver: '',
      date: '',
      distance: '',
      fuel: '',
      days: '',
      hours: '',
      general: '',
    });

    if (!validateForm()) {
      showToast('error', 'Validation Error', 'Please fill all required fields correctly');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const formattedDateTime = moment(date).format('YYYY-MM-DDTHH:mm:ss');
    
      const tripData = {
        trip_id: tripNameValue,
        thing_id: vehicleValue,
        driver: driverValue,
        scheduled_datetime: formattedDateTime,
        estimated_distance: distance ? parseFloat(distance) : 0,
        estimated_fuel: fuel ? parseFloat(fuel) : 0,
        estimated_time: estTime || '00:00:00',
        load_details: loadDetails || '',
      };

      const apiUrl = `${BASE_URL}trips/trip_assignment/`;
      const response = await POSTNETWORK(apiUrl, tripData, true);

      if (response?.status === 'success') {
        showToast('success', 'Success', response.msg || 'Trip assigned successfully!');
        resetForm();
      } else if (response?.status === 'failed') {
        const serverMsg = response?.msg || 'Could not assign trip. Please try again.';
        const isAlreadyExists = /already exists/i.test(serverMsg);
        showToast(
          'error',
          isAlreadyExists ? 'Trip already assigned' : 'Trip assignment failed',
          serverMsg
        );
        // Don't reset form so user can change trip/vehicle/driver and retry
      } else {
        showToast('error', 'Error', response?.msg || 'Failed to assign trip. Please try again.');
      }
    } catch (error) {
      if (__DEV__) console.error('Error assigning trip:', error?.message || error);
      setIsSubmitting(false);
      setLoading(false);

      if (error?.message?.includes('Network request failed')) {
        showToast('error', 'Network Error', 'Please check your internet connection and try again.');
      } else if (error?.message?.includes('401')) {
        showToast('error', 'Authentication Error', 'Session expired. Please login again.');
      } else if (error?.message?.includes('500')) {
        showToast('error', 'Server Error', 'Server is temporarily unavailable. Please try again later.');
      } else {
        showToast('error', 'Submission Failed', error?.message || 'Failed to assign trip. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
    
  };

  const handleDaysChange = (text) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setDays(cleanText);
    calculateTotalTime(cleanText, hours);
    clearError('days');
  };

  const handleHoursChange = (text) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setHours(cleanText);
    calculateTotalTime(days, cleanText);
    clearError('hours');
  };

  const calculateTotalTime = (daysValue, hoursValue) => {
    const daysNum = parseInt(daysValue) || 0;
    const hoursNum = parseInt(hoursValue) || 0;
    const totalHours = daysNum * 24 + hoursNum;
    const formattedTime = `${String(totalHours).padStart(2, '0')}:00:00`;
    setEstTime(formattedTime);
  };

  const toggleDropdown = (dropdownType) => {
    setTripNameOpen(false);
    setTripStatusOpen(false);
    setVehicleOpen(false);
    setDriverOpen(false);

    if (dropdownType === 'tripName') {
      setTripNameOpen(true);
      zIndexCounter.current += 300;
    } else if (dropdownType === 'vehicle') {
      setVehicleOpen(true);
      zIndexCounter.current += 200;
    } else if (dropdownType === 'driver') {
      setDriverOpen(true);
      zIndexCounter.current += 100;
    }
  };

  const resetForm = () => {
    setTripNameValue(null);
    setVehicleValue(null);
    setDriverValue(null);
    setDistance('');
    setFuel('');
    setEstTime('');
    setLoadDetails('');
    setDate(new Date());
    setTripStatusValue(null);
    setDays('');
    setHours('');
    setTripDate('');
    setShowCalendar(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setErrors({
      tripName: '',
      vehicle: '',
      driver: '',
      date: '',
      distance: '',
      fuel: '',
      days: '',
      hours: '',
      general: '',
    });

    GetVehicle();
    GetTrip();
    GetDrivers();
    showToast('info', 'Form Reset', 'All fields have been cleared');
  };

  useFocusEffect(
    React.useCallback(() => {
      resetForm();
      return () => {};
    }, []),
  );

  return (
    <>
      <StatusBar backgroundColor={'#0284c7'} barStyle="light-content" />
      <Header
        title="Trip Assignment"
        onMenuPress={() => navigation.openDrawer()}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Row: Trip Name */}
          <View style={styles.row}>
            <View style={[styles.inputItem, { zIndex: tripNameOpen ? zIndexCounter.current + 300 : 1 }]}>
              <Text style={styles.label}>Trip Name *</Text>
              <DropDownPicker
                open={tripNameOpen}
                value={tripNameValue}
                items={tripNameItems}
                setOpen={(open) => {
                  if (open) toggleDropdown('tripName');
                  else setTripNameOpen(false);
                }}
                setValue={setTripNameValue}
                setItems={setTripNameItems}
                placeholder="Select Trip"
                listMode="MODAL"
                style={[styles.dropdown, errors.tripName && styles.errorBorder]}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                searchable={true}
                modalProps={{ animationType: 'slide' }}
                modalContentContainerStyle={styles.modalContent}
                modalTitle="Select Trip"
                modalTitleStyle={styles.modalTitle}
                onSelectItem={() => clearError('tripName')}
              />
              {errors.tripName && <Text style={styles.errorText}>{errors.tripName}</Text>}
            </View>
          </View>

          {/* Row: Date & Time */}
          <View style={styles.row}>
            <View style={styles.inputItem}>
              <Text style={styles.label}>Scheduled Date & Time *</Text>
              <TouchableOpacity
                style={[styles.dateButton, errors.date && styles.errorBorder]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {moment(date).format('DD MMM YYYY, hh:mm A')}
                </Text>
              </TouchableOpacity>
              {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}

              {showDatePicker && (
                <DateTimePicker
                  testID="datePicker"
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeDate}
                  minimumDate={new Date()}
                  {...(Platform.OS === 'android' && {
                    positiveButton: { label: 'OK', textColor: '#0284c7' },
                    negativeButton: { label: 'Cancel', textColor: '#ef4444' },
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
                    positiveButton: { label: 'OK', textColor: '#0284c7' },
                    negativeButton: { label: 'Cancel', textColor: '#ef4444' },
                  })}
                />
              )}
            </View>
          </View>

          {/* Row: Vehicle & Driver */}
          <View style={styles.row}>
            <View style={[styles.inputItem, { zIndex: vehicleOpen ? zIndexCounter.current + 200 : 1 }]}>
              <Text style={styles.label}>Assigned Vehicle *</Text>
              <DropDownPicker
                open={vehicleOpen}
                value={vehicleValue}
                items={vehicleItems}
                setOpen={(open) => {
                  if (open) toggleDropdown('vehicle');
                  else setVehicleOpen(false);
                }}
                setValue={setVehicleValue}
                setItems={setVehicleItems}
                placeholder="Select Vehicle"
                listMode="MODAL"
                style={[styles.dropdown, errors.vehicle && styles.errorBorder]}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                searchable={true}
                modalProps={{ animationType: 'slide' }}
                modalContentContainerStyle={styles.modalContent}
                modalTitle="Select Vehicle"
                modalTitleStyle={styles.modalTitle}
                onSelectItem={() => clearError('vehicle')}
              />
              {errors.vehicle && <Text style={styles.errorText}>{errors.vehicle}</Text>}
            </View>

            <View style={[styles.inputItem, { zIndex: driverOpen ? zIndexCounter.current + 100 : 1 }]}>
              <Text style={styles.label}>Assigned Driver *</Text>
              <DropDownPicker
                open={driverOpen}
                value={driverValue}
                items={driverItems}
                setOpen={(open) => {
                  if (open) toggleDropdown('driver');
                  else setDriverOpen(false);
                }}
                setValue={setDriverValue}
                setItems={setDriverItems}
                placeholder="Select Driver"
                listMode="MODAL"
                style={[styles.dropdown, errors.driver && styles.errorBorder]}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                searchable={true}
                modalProps={{ animationType: 'slide' }}
                modalContentContainerStyle={styles.modalContent}
                modalTitle="Select Driver"
                modalTitleStyle={styles.modalTitle}
                onSelectItem={() => clearError('driver')}
              />
              {errors.driver && <Text style={styles.errorText}>{errors.driver}</Text>}
            </View>
          </View>

          {/* Row: Distance & Fuel */}
          <View style={styles.row}>
            <View style={styles.inputItem}>
              <Text style={styles.label}>Estimated Distance (km)</Text>
              <TextInput
                style={[styles.input, errors.distance && styles.errorBorder]}
                value={distance}
                placeholderTextColor={'#9ca3af'}
                onChangeText={(text) => {
                  setDistance(text);
                  clearError('distance');
                }}
                keyboardType="numeric"
                placeholder="0"
              />
              {errors.distance && <Text style={styles.errorText}>{errors.distance}</Text>}
            </View>

            <View style={styles.inputItem}>
              <Text style={styles.label}>Estimated Fuel Usage (L)</Text>
              <TextInput
                style={[styles.input, errors.fuel && styles.errorBorder]}
                value={fuel}
                onChangeText={(text) => {
                  setFuel(text);
                  clearError('fuel');
                }}
                keyboardType="numeric"
                placeholderTextColor={'#9ca3af'}
                placeholder="0"
              />
              {errors.fuel && <Text style={styles.errorText}>{errors.fuel}</Text>}
            </View>
          </View>

          {/* Estimated Duration */}
          <View style={styles.inputItem}>
            <Text style={styles.sectionHeader}>Estimated Duration</Text>
            <View style={styles.durationContainer}>
              <View style={styles.durationInputContainer}>
                <TextInput
                  placeholder="0"
                  placeholderTextColor={'#9ca3af'}
                  value={days}
                  onChangeText={handleDaysChange}
                  style={[styles.input, errors.days && styles.errorBorder]}
                  keyboardType="numeric"
                />
                <Text style={styles.durationLabel}>Days</Text>
                {errors.days && <Text style={styles.errorText}>{errors.days}</Text>}
              </View>

              <View style={styles.durationInputContainer}>
                <TextInput
                  placeholder="0"
                  placeholderTextColor={'#9ca3af'}
                  value={hours}
                  onChangeText={handleHoursChange}
                  style={[styles.input, errors.hours && styles.errorBorder]}
                  keyboardType="numeric"
                />
                <Text style={styles.durationLabel}>Hours</Text>
                {errors.hours && <Text style={styles.errorText}>{errors.hours}</Text>}
              </View>
            </View>
          </View>

          {/* Load Details */}
          <View style={styles.inputItem}>
            <Text style={styles.sectionHeader}>Load Details</Text>
            <View style={styles.commentsContainer}>
              <TextInput
                multiline
                numberOfLines={4}
                placeholderTextColor={'#9ca3af'}
                value={loadDetails}
                onChangeText={(text) => {
                  setLoadDetails(text);
                  clearError('loadDetails');
                }}
                style={[styles.textArea, errors.loadDetails && styles.errorBorder]}
                placeholder="Enter load details (max 500 characters)"
                maxLength={500}
              />
              <Text style={styles.charCount}>{loadDetails.length}/500</Text>
            </View>
            {errors.loadDetails && <Text style={styles.errorText}>{errors.loadDetails}</Text>}
          </View>

          {/* General Error */}
          {errors.general && (
            <View style={styles.generalErrorContainer}>
              <Icon name="warning" size={20} color="#ef4444" />
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          )}

          {/* Calendar Modal */}
          <Modal visible={showCalendar} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.calendarContainer}>
                <Calendar
                  onDayPress={handleDayPress}
                  markedDates={{
                    [tripDate]: { selected: true, selectedColor: '#0284c7' },
                  }}
                  theme={{
                    todayTextColor: '#0284c7',
                    arrowColor: '#0284c7',
                  }}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowCalendar(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={resetForm}
              disabled={isSubmitting}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Assign Trip</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Summary Section */}
          {(tripNameValue || vehicleValue || driverValue || date) && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Trip Summary</Text>
              {tripNameValue && (
                <Text style={styles.summaryText}>
                  🚌 Trip: {tripNameItems.find((t) => t.value === tripNameValue)?.label}
                </Text>
              )}
              {vehicleValue && (
                <Text style={styles.summaryText}>
                  🚗 Vehicle: {vehicleItems.find((v) => v.value === vehicleValue)?.label}
                </Text>
              )}
              {driverValue && (
                <Text style={styles.summaryText}>
                  👤 Driver: {driverItems.find((d) => d.value === driverValue)?.label}
                </Text>
              )}
              {date && (
                <Text style={styles.summaryText}>
                  📅 Date: {moment(date).format('DD MMM YYYY, hh:mm A')}
                </Text>
              )}
            </View>
          )}

          <Loader visible={loading} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast />
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
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputItem: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    color: '#111827',
    height: 45,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderWidth: 1.5,
    borderRadius: 6,
    height: 45,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderWidth: 1.5,
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
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  dateButtonText: {
    color: '#374151',
    textAlign: 'center',
  },
  textArea: {
    color: '#111827',
    height: 100,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 10,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    fontSize: 14,
  },
  commentsContainer: {
    position: 'relative',
  },
  charCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#6b7280',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
    color: '#111827',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  durationInputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  durationLabel: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 4,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  resetButton: {
    backgroundColor: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#0284c7',
  },
  disabledButton: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  errorBorder: {
    borderColor: '#ef4444',
  },
  generalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  generalErrorText: {
    color: '#ef4444',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  summaryContainer: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0284c7',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
});

export default TripAssignment;