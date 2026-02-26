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
import { useAppTheme } from '../../theme/ThemeContext';

const TripAssignment = ({ navigation }) => {
  const { theme, isDark } = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
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
      return () => { };
    }, []),
  );

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? 'light-content' : 'dark-content'} />
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
                    positiveButton: { label: 'OK', textColor: theme.colors.primary },
                    negativeButton: { label: 'Cancel', textColor: theme.colors.error },
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
                    positiveButton: { label: 'OK', textColor: theme.colors.primary },
                    negativeButton: { label: 'Cancel', textColor: theme.colors.error },
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
                placeholderTextColor={theme.colors.textPlaceholder}
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
                placeholderTextColor={theme.colors.textPlaceholder}
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
                  placeholderTextColor={theme.colors.textPlaceholder}
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
                  placeholderTextColor={theme.colors.textPlaceholder}
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
                placeholderTextColor={theme.colors.textPlaceholder}
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
              <Icon name="warning" size={20} color={theme.colors.error} />
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
                    [tripDate]: { selected: true, selectedColor: theme.colors.primary },
                  }}
                  theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: theme.colors.textSecondary,
                selectedDayBackgroundColor: '#4F46E5',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.text,
                textDisabledColor: theme.colors.textMuted,
                dotColor: '#4F46E5',
                selectedDotColor: '#FFFFFF',
                arrowColor: theme.colors.primary,
                monthTextColor: theme.colors.text,
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
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
                <ActivityIndicator color={theme.colors.white} size="small" />
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

const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  inputItem: {
    flex: 1,
  },
  label: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    color: theme.colors.text,
    height: 52,
    borderWidth: 1.5,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.inputBg,
    fontSize: theme.typography.base,
    ...theme.shadows.sm,
  },
  dropdown: {
    backgroundColor: theme.colors.inputBg,
    borderColor: theme.colors.inputBorder,
    borderWidth: 1.5,
    borderRadius: theme.radius.md,
    height: 52,
    ...theme.shadows.sm,
  },
  dropdownContainer: {
    backgroundColor: theme.colors.cardBg,
    borderColor: theme.colors.inputBorder,
    borderWidth: 1.5,
    marginTop: 2,
    borderRadius: theme.radius.md,
    ...theme.shadows.md,
  },
  dropdownText: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
  },
  dropdownPlaceholder: {
    color: theme.colors.textPlaceholder,
    fontSize: theme.typography.sm,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
  },
  modalTitle: {
    fontWeight: theme.typography.bold,
  },
  dateButton: {
    height: 52,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.inputBg,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.sm,
  },
  dateButtonText: {
    color: theme.colors.text,
    textAlign: 'center',
    fontSize: theme.typography.sm,
  },
  textArea: {
    color: theme.colors.text,
    height: 120,
    borderWidth: 1.5,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    textAlignVertical: 'top',
    backgroundColor: theme.colors.inputBg,
    fontSize: theme.typography.base,
    ...theme.shadows.sm,
  },
  commentsContainer: {
    position: 'relative',
  },
  charCount: {
    position: 'absolute',
    bottom: theme.spacing.xs,
    right: theme.spacing.sm,
    fontSize: theme.typography.xs,
    color: theme.colors.textMuted,
  },
  sectionHeader: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  durationInputContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  durationLabel: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xxs,
    fontSize: theme.typography.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  calendarContainer: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  closeButton: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    ...theme.shadows.glow,
  },
  closeButtonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.bold,
    fontSize: theme.typography.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  resetButton: {
    backgroundColor: theme.colors.borderDark,
    ...theme.shadows.sm,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.glow,
  },
  disabledButton: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.xs,
    marginTop: theme.spacing.xxs,
    marginLeft: theme.spacing.xxs,
    fontWeight: theme.typography.medium,
  },
  errorBorder: {
    borderColor: theme.colors.error,
  },
  generalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.errorLight,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  generalErrorText: {
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
    flex: 1,
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
  },
  summaryContainer: {
    backgroundColor: theme.colors.cardBg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginTop: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: theme.colors.inputBorder,
    ...theme.shadows.md,
  },
  summaryTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.sm,
  },
  summaryText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.medium,
  },
});

export default TripAssignment;