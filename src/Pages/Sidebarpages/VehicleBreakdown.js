import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Image,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import Header from '../../components/Header';
import { useStatusBarHeight } from '../../constants/config';
import { BASE_URL } from '../../constants/url';
import { GETNETWORK, POSTNETWORK } from '../../utils/Network';
import { pick } from '@react-native-documents/picker';
import { Icon } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { getObjByKey, storeObjByKey } from '../../utils/Storage';
import Geolocation from '@react-native-community/geolocation';
import { useFocusEffect } from '@react-navigation/native';
import { Loader } from '../../components/Loader';
import Toast from 'react-native-toast-message';
import theme from '../../theme';

const VehicleBreakdown = ({ navigation }) => {
  const statusBarHeight = useStatusBarHeight();
  const [incidentId, setIncidentId] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [latitude, setlatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown states
  const [driverOpen, setDriverOpen] = useState(false);
  const [driverValue, setDriverValue] = useState(null);
  const [driverItems, setDriverItems] = useState([]);

  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vehicleValue, setVehicleValue] = useState(null);
  const [vehicleItems, setVehicleItems] = useState([]);

  const [tripOpen, setTripOpen] = useState(false);
  const [tripValue, setTripValue] = useState(null);
  const [tripItems, setTripItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const zIndexCounter = useRef(1000);

  // Validation errors state
  const [errors, setErrors] = useState({
    tripId: '',
    vehicleId: '',
    date: '',
    driver: '',
    description: '',
    general: ''
  });

  // Show toast notification
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

  // Validation function
  const validateForm = () => {
    const newErrors = {
      tripId: '',
      vehicleId: '',
      date: '',
      driver: '',
      description: '',
      general: ''
    };

    let isValid = true;

    if (!tripValue) {
      newErrors.tripId = 'Trip ID is required';
      isValid = false;
    }

    if (!vehicleValue) {
      newErrors.vehicleId = 'Vehicle ID is required';
      isValid = false;
    }

    if (!date || isNaN(date.getTime())) {
      newErrors.date = 'Valid date and time is required';
      isValid = false;
    } else if (moment(date).isAfter(moment())) {
      newErrors.date = 'Cannot select future dates';
      isValid = false;
    }

    if (!driverValue) {
      newErrors.driver = 'Driver selection is required';
      isValid = false;
    }

    if (!description || description.trim().length === 0) {
      newErrors.description = 'Description of issue is required';
      isValid = false;
    }

    if (description.trim().length < 10) {
      newErrors.description = 'Description should be at least 10 characters long';
      isValid = false;
    }

    if (!latitude || !longitude) {
      newErrors.general = 'Location data is missing. Please ensure location services are enabled';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Clear specific error when user starts typing/selecting
  const clearError = (fieldName) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };

  const handleAttachment = async () => {
    try {
      const pickResults = await pick();
      console.log('Attachment selected:', pickResults);

      if (pickResults && pickResults.length > 0) {
        const pickResult = pickResults[0];

        // Validate file size (10MB limit)
        if (pickResult.size && pickResult.size > 10 * 1024 * 1024) {
          showToast('error', 'File Too Large', 'Please select a file smaller than 10MB');
          return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(pickResult.type)) {
          showToast('error', 'Invalid File Type', 'Please select JPEG, PNG, or PDF files only');
          return;
        }

        setAttachments([{
          uri: pickResult.uri,
          name: pickResult.name,
          type: pickResult.type,
        }]);

        showToast('success', 'File Selected', 'Attachment added successfully');
      }
    } catch (error) {
      console.error('Error picking file:', error);
      showToast('error', 'File Selection Failed', 'Failed to select file. Please try again.');
    }
  };

  const removeAttachment = () => {
    setAttachments([]);
    showToast('info', 'Attachment Removed', 'File has been removed');
  };

  const GetIncidentId = async () => {
    try {
      const Url = `${BASE_URL}maintenance/vehicle_breakdown/`;
      const response = await GETNETWORK(Url, true);
      console.log('Incident Data:', response?.latest_incident_number);

      if (response) {
        const latestNumber = response?.latest_incident_number;
        setIncidentId(latestNumber);
        showToast('success', 'Incident ID Generated', `ID: ${latestNumber}`);
      } else {
        showToast('error', 'Data Error', 'No incident number found in response.');
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
      showToast('error', 'Network Error', 'Failed to fetch incident data. Please try again.');
    }
  };

  const GetDrivers = async () => {
    const Url = `${BASE_URL}trips/driver_master/`;
    try {
      const response = await GETNETWORK(Url, true);
      const drivers = response.data || [];
      const mappedItems = drivers.map(item => ({
        label: item.driver_name,
        value: item.driver_master_id,
      }));
      setDriverItems(mappedItems);
      showToast('success', 'Drivers Loaded', `${drivers.length} drivers loaded`);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      showToast('error', 'Data Error', 'Failed to fetch driver data. Please try again.');
    }
  };

  // Date Picker Handler
  const onChangeDate = (event, selectedDate) => {
    console.log('Selected date:', selectedDate);
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());

      // Validate date is not in future
      if (moment(newDate).isAfter(moment())) {
        showToast('error', 'Invalid Date', 'Cannot select future dates');
        return;
      }

      setDate(newDate);
      clearError('date');
      setShowTimePicker(true);
      showToast('success', 'Date Selected', moment(newDate).format('DD MMM YYYY'));
    }
  };

  // Time Picker Handler
  const onChangeTime = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());

      // Validate date is not in future
      if (moment(newDate).isAfter(moment())) {
        showToast('error', 'Invalid Time', 'Cannot select future time');
        return;
      }

      setDate(newDate);
      clearError('date');
      showToast('success', 'Time Selected', moment(newDate).format('hh:mm A'));
    }
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({
      tripId: '',
      vehicleId: '',
      date: '',
      driver: '',
      description: '',
      general: ''
    });

    // Validate form
    if (!validateForm()) {
      showToast('error', 'Validation Error', 'Please fill all required fields correctly');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const loginRes = await getObjByKey('loginResponse');
      const token = loginRes?.data?.access_token;

      if (!token) {
        showToast('error', 'Authentication Error', 'Authorization token missing.');
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      const formattedDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
      const selectedDriver = driverItems.find(driver => driver.value === driverValue);

      const formData = new FormData();
      formData.append('thing_id', vehicleValue);
      formData.append('driver_master_id', selectedDriver?.value || '');
      formData.append('reported_issue', description);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('created_on', formattedDate);
      formData.append('incident_id', incidentId);
      formData.append('trip_id', tripValue);

      if (attachments.length > 0) {
        formData.append('attachment', {
          uri: attachments[0].uri,
          name: attachments[0].name || 'upload.jpg',
          type: attachments[0].type || 'image/jpeg',
        });
      }

      console.log('Submitting breakdown data:', formData);

      const response = await fetch(`${BASE_URL}maintenance/vehicle_breakdown/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || `Server error: ${response.status}`);
      }

      // Success handling
      setIsSubmitting(false);
      setLoading(false);

      Alert.alert(
        'Success!',
        `Breakdown reported successfully! Incident Number: ${result.incident_number}`,
        [
          {
            text: 'Report Another',
            onPress: () => {
              resetForm();
              showToast('success', 'Ready', 'You can now submit another breakdown report');
            },
          },
          {
            text: 'View Reports',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );

    } catch (error) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
      setLoading(false);

      // More specific error handling
      if (error.message.includes('Network request failed')) {
        showToast('error', 'Network Error', 'Please check your internet connection and try again.');
      } else if (error.message.includes('401')) {
        showToast('error', 'Authentication Error', 'Session expired. Please login again.');
      } else if (error.message.includes('500')) {
        showToast('error', 'Server Error', 'Server is temporarily unavailable. Please try again later.');
      } else {
        showToast('error', 'Submission Failed', error.message || 'Failed to submit breakdown. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setIncidentId('');
    setTripValue(null);
    setVehicleValue(null);
    setDate(new Date());
    setlatitude('');
    setLongitude('');
    setAttachments([]);
    setLocation({});
    setDescription('');
    setDriverValue(null);
    setErrors({
      tripId: '',
      vehicleId: '',
      date: '',
      driver: '',
      description: '',
      general: ''
    });

    // Re-fetch necessary data
    GetVehicle();
    GetIncidentId();
    GetTrip();
    getCurrentLocation();
    GetDrivers();

    showToast('info', 'Form Reset', 'All fields have been cleared');
  };

  useFocusEffect(
    React.useCallback(() => {
      resetForm();
      return () => { };
    }, []),
  );

  useEffect(() => {
    GetVehicle();
    GetIncidentId();
    GetTrip();
    getCurrentLocation();
    GetDrivers();
  }, []);

  const getCurrentLocation = async () => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setLoading(false);
          console.log('Latitude:', latitude);
          console.log('Longitude:', longitude);
          reverseGeocode(latitude, longitude);
          resolve({ latitude, longitude });
        },
        error => {
          console.error('Error getting location:', error);
          setLoading(false);

          let errorMessage = 'Failed to get location. Please try again.';
          if (error.code === 1) {
            errorMessage = 'Location permission is required to access your location.';
          } else if (error.code === 2) {
            errorMessage = 'Could not determine your location. Please try again.';
          } else if (error.code === 3) {
            errorMessage = 'Location request timed out. Please try again.';
          }

          setErrors(prev => ({ ...prev, general: errorMessage }));
          showToast('error', 'Location Error', errorMessage);
          reject(error);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  };

  const reverseGeocode = async (latitude, longitude) => {
    setlatitude(latitude.toString());
    setLongitude(longitude.toString());
    setLoading(true);

    try {
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/reverse?api_key=eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImRhZmY2MTE0ZmNhYzRhZjViYTUyZjY0ZWMyMTRlYTI5IiwiaCI6Im11cm11cjY0In0=&point.lon=${longitude}&point.lat=${latitude}`,
      );
      const result = await response.json();
      setLoading(false);

      const firstFeature = result?.features?.[0];
      if (firstFeature?.properties) {
        const { street, label } = firstFeature.properties;
        const locationData = { street, label };
        setLocation(locationData);
        storeObjByKey('location', locationData);
        showToast('success', 'Location Updated', 'Current location detected successfully');
      } else {
        console.warn('No valid feature found in reverse geocode result');
        showToast('warning', 'Location Info', 'Coordinates saved but address details unavailable');
      }
    } catch (error) {
      console.error('Error fetching reverse geocode:', error);
      setLoading(false);
      showToast('warning', 'Location Info', 'Could not fetch location details, but coordinates are saved.');
    }
  };

  const GetVehicle = async () => {
    setLoading(true);
    const Url = `${BASE_URL}projects/117/things/?page=1&search=`;

    try {
      const response = await GETNETWORK(Url, true);
      const vehicles = response.data?.things || [];
      const mappedItems = vehicles.map(item => ({
        label: item.thing_name,
        value: item.thing_id,
      }));
      setVehicleItems(mappedItems);
      setLoading(false);
      showToast('success', 'Vehicles Loaded', `${vehicles.length} vehicles loaded`);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setLoading(false);
      showToast('error', 'Data Error', 'Failed to fetch vehicle data. Please try again.');
    }
  };

  const GetTrip = async () => {
    const Url = `${BASE_URL}trips/trip_master/`;
    setLoading(true);

    try {
      const response = await GETNETWORK(Url, true);
      const trips = response.data || [];
      const mappedItems = trips.map(item => ({
        label: item.trip_name,
        value: item.trip_id,
      }));
      setTripItems(mappedItems);
      setLoading(false);
      showToast('success', 'Trips Loaded', `${trips.length} trips loaded`);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setLoading(false);
      showToast('error', 'Data Error', 'Failed to fetch trip data. Please try again.');
    }
  };

  // Toggle dropdown with z-index management
  const toggleDropdown = (dropdownType) => {
    // Close all dropdowns first
    setDriverOpen(false);
    setVehicleOpen(false);
    setTripOpen(false);

    // Open the selected dropdown
    if (dropdownType === 'driver') {
      setDriverOpen(true);
      zIndexCounter.current += 100;
    } else if (dropdownType === 'vehicle') {
      setVehicleOpen(true);
      zIndexCounter.current += 200;
    } else if (dropdownType === 'trip') {
      setTripOpen(true);
      zIndexCounter.current += 300;
    }
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Header
        onMenuPress={() => navigation.openDrawer()}
        title="Vehicle Breakdown"
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">



          {/* Incident ID & Trip ID */}
          <View style={styles.row}>
            <View style={styles.inputItem}>
              <Text style={styles.label}>Incident ID</Text>
              <TextInput
                placeholderTextColor={theme.colors.textPlaceholder}
                editable={false}
                style={styles.input}
                placeholder="Auto-generated Incident ID"
                value={incidentId}
                onChangeText={setIncidentId}
              />
            </View>
            <View style={[styles.inputItem, { zIndex: tripOpen ? zIndexCounter.current + 300 : 1 }]}>
              <Text style={styles.label}>Trip ID *</Text>
              <DropDownPicker
                open={tripOpen}
                value={tripValue}
                items={tripItems}
                setOpen={(open) => {
                  if (open) toggleDropdown('trip');
                  else setTripOpen(false);
                }}
                setValue={setTripValue}
                setItems={setTripItems}
                placeholder="Select Trip"
                searchable={true}
                style={[styles.dropdown, errors.tripId ? styles.errorBorder : null]}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                modalProps={{ animationType: 'slide' }}
                listMode="MODAL"
                modalContentContainerStyle={styles.modalContent}
                modalTitle="Select Trip"
                modalTitleStyle={styles.modalTitle}
                onSelectItem={() => clearError('tripId')}
              />
              {errors.tripId ? <Text style={styles.errorText}>{errors.tripId}</Text> : null}
            </View>
          </View>

          {/* Vehicle ID & Date */}
          <View style={styles.row}>
            <View style={[styles.inputItem, { zIndex: vehicleOpen ? zIndexCounter.current + 200 : 1 }]}>
              <Text style={styles.label}>Vehicle *</Text>
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
                searchable={true}
                style={[styles.dropdown, errors.vehicleId ? styles.errorBorder : null]}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                modalProps={{ animationType: 'slide' }}
                listMode="MODAL"
                modalContentContainerStyle={styles.modalContent}
                modalTitle="Select Vehicle"
                modalTitleStyle={styles.modalTitle}
                onSelectItem={() => clearError('vehicleId')}
              />
              {errors.vehicleId ? <Text style={styles.errorText}>{errors.vehicleId}</Text> : null}
            </View>
            <View style={styles.inputItem}>
              <Text style={styles.label}>Date & Time *</Text>
              <TouchableOpacity
                style={[styles.dateButton, errors.date ? styles.errorBorder : null]}
                onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateButtonText}>
                  {moment(date).format('DD MMM YYYY, hh:mm A')}
                </Text>
              </TouchableOpacity>
              {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}

              {showDatePicker && (
                <DateTimePicker
                  testID="datePicker"
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeDate}
                  maximumDate={new Date()} // Prevent future dates
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

          {/* Location & Driver */}
          <View style={styles.row}>
            <View style={styles.inputItem}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor={theme.colors.textPlaceholder}
                placeholder="Auto-detected location"
                value={location?.label || ''}
                onChangeText={text => setLocation({ ...location, label: text })}
                editable={false}
              />
            </View>
            <View style={[styles.inputItem, { zIndex: driverOpen ? zIndexCounter.current + 100 : 1 }]}>
              <Text style={styles.label}>Driver *</Text>
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
                style={[styles.dropdown, errors.driver ? styles.errorBorder : null]}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                searchable={true}
                listMode="MODAL"
                onSelectItem={() => clearError('driver')}
              />
              {errors.driver ? <Text style={styles.errorText}>{errors.driver}</Text> : null}
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputItem}>
            <Text style={styles.label}>Description of Issue *</Text>
            <View style={styles.commentsContainer}>
              <TextInput
                style={[styles.input, styles.multilineInput, errors.description ? styles.errorBorder : null]}
                placeholder="Describe the issue (minimum 10 characters)"
                placeholderTextColor={theme.colors.textPlaceholder}
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  clearError('description');
                }}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={styles.charCount}>
                {description.length}/500
              </Text>
            </View>
            {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
          </View>

          {/* Attachment */}
          <View style={{ ...styles.inputItem, marginBottom: 16 }}>
            <Text style={styles.label}>Attachments</Text>
            {attachments?.length > 0 ? (
              <View style={styles.attachmentPreviewContainer}>
                {attachments[0].type?.startsWith('image/') ? (
                  <Image
                    source={{ uri: attachments[0].uri }}
                    style={styles.attachmentImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.filePreview}>
                    <Icon name="insert-drive-file" size={40} color={theme.colors.primary} />
                    <Text style={styles.fileName} numberOfLines={1}>
                      {attachments[0].name}
                    </Text>
                  </View>
                )}
                <View style={styles.attachmentActions}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={removeAttachment}>
                    <Icon name="close" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.attachmentButton}
                onPress={handleAttachment}>
                <Text style={styles.attachmentButtonText}>Choose File (Max 10MB)</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* General Error */}
          {errors.general ? (
            <View style={styles.generalErrorContainer}>
              <Icon name="warning" size={20} color={theme.colors.error} />
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          ) : null}

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
              style={[
                styles.button,
                styles.submitButton,
                isSubmitting && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.white} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Save </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Summary */}
          {(tripValue || vehicleValue || driverValue) && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Report Summary</Text>
              {tripValue && (
                <Text style={styles.summaryText}>
                  🚌 Trip: {tripItems.find(t => t.value === tripValue)?.label}
                </Text>
              )}
              {vehicleValue && (
                <Text style={styles.summaryText}>
                  🚗 Vehicle: {vehicleItems.find(v => v.value === vehicleValue)?.label}
                </Text>
              )}
              {driverValue && (
                <Text style={styles.summaryText}>
                  👤 Driver: {driverItems.find(d => d.value === driverValue)?.label}
                </Text>
              )}
              {date && (
                <Text style={styles.summaryText}>
                  📅 Date: {moment(date).format('DD MMM YYYY, hh:mm A')}
                </Text>
              )}
            </View>
          )}
        </ScrollView>
        <Loader visible={loading} />
      </KeyboardAvoidingView>
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  progressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  progressTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  progressText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
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
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    fontSize: theme.typography.base,
    ...theme.shadows.sm,
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
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
  dropdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderRadius: theme.radius.md,
    height: 52,
    ...theme.shadows.sm,
  },
  dropdownContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.sm,
  },
  dateButtonText: {
    color: theme.colors.text,
    textAlign: 'center',
    fontSize: theme.typography.sm,
  },
  attachmentButton: {
    height: 52,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  attachmentButtonText: {
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
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
  attachmentPreviewContainer: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
    ...theme.shadows.sm,
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.radius.sm,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  fileName: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
    flex: 1,
    fontSize: theme.typography.sm,
  },
  attachmentActions: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
  },
  removeButton: {
    padding: theme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.radius.full,
    ...theme.shadows.sm,
  },
  errorBorder: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.xs,
    marginTop: theme.spacing.xxs,
    marginLeft: theme.spacing.xxs,
    fontWeight: theme.typography.medium,
  },
  generalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.errorLight,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginTop: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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

export default VehicleBreakdown;