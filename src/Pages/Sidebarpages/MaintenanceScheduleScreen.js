import React, {useCallback, useEffect, useState, useRef} from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import {Calendar} from 'react-native-calendars';
import Header from '../../components/Header';
import {GETNETWORK, POSTNETWORK} from '../../utils/Network';
import { useStatusBarHeight } from '../../constants/config';
import {BASE_URL} from '../../constants/url';
import { Loader } from '../../components/Loader';
import Toast from 'react-native-toast-message';
import moment from 'moment';

const MaintenanceScheduleScreen = () => {
  const statusBarHeight = useStatusBarHeight();
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vehicle Dropdown
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vehicleValue, setVehicleValue] = useState(null);
  const [vehicleItems, setVehicleItems] = useState([]);

  // Maintenance Type Dropdown
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [maintenanceValue, setMaintenanceValue] = useState(null);
  const [maintenanceItems, setMaintenanceItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    date: '',
    vehicle: '',
    maintenanceType: '',
    comments: '',
  });

  const zIndexCounter = useRef(1000);

  // Toast configuration
  const showToast = (type, title, message) => {
    Toast.show({
      type,
      position: 'top',
      text1: title,
      text2: message,
      visibilityTime: type === 'error' ? 4000 : 3000,
      autoHide: true,
      topOffset: statusBarHeight,
    });
  };

  // Clear validation errors for a specific field
  const clearValidationError = (fieldName) => {
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };

  // Clear all validation errors
  const clearAllValidationErrors = () => {
    setValidationErrors({
      date: '',
      vehicle: '',
      maintenanceType: '',
      comments: '',
    });
  };

  // Optimized dropdown handlers
  const handleVehicleDropdownOpen = (open) => {
    setVehicleOpen(open);
    if (open) {
      setMaintenanceOpen(false);
      clearValidationError('vehicle');
    }
  };

  const handleMaintenanceDropdownOpen = (open) => {
    setMaintenanceOpen(open);
    if (open) {
      setVehicleOpen(false);
      clearValidationError('maintenanceType');
    }
  };

  const handleDayPress = day => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
    clearValidationError('date');
    showToast('success', 'Date Selected', moment(day.dateString).format('DD MMM YYYY'));
  };

  const resetForm = () => {
    setSelectedDate('');
    setVehicleValue(null);
    setMaintenanceValue(null);
    setComments('');
    setVehicleOpen(false);
    setMaintenanceOpen(false);
    clearAllValidationErrors();
    
    showToast('info', 'Form Reset', 'All fields have been cleared');
  };

  useFocusEffect(
    useCallback(() => {
      resetForm();
      const initializeData = async () => {
        await Promise.all([GetVehicle(), GetMaintenance()]);
      };
      initializeData();

      return () => {
        // Cleanup
        setVehicleOpen(false);
        setMaintenanceOpen(false);
        clearAllValidationErrors();
      };
    }, []),
  );

  const GetMaintenance = async () => {
    if (loading) return;
    
    setLoading(true);
    const Url = `${BASE_URL}maintenance/maintenance_master/`;
    
    try {
      const response = await GETNETWORK(Url, true);
      
      if (response && response.data && Array.isArray(response.data)) {
        const mappedItems = response.data.map(item => ({
          label: item.maintenance_name,
          value: item.maintenance_id,
        }));
        
        setMaintenanceItems(mappedItems);
        showToast('success', 'Maintenance Types Loaded', `${response.data.length} types loaded`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching maintenance:', error);
      showToast('error', 'Load Failed', 'Failed to fetch maintenance data');
      
      // Show detailed error for debugging
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const GetVehicle = async () => {
    if (loading) return;
    
    setLoading(true);
    const Url = `${BASE_URL}projects/117/things/?page=1&search=`;
    
    try {
      const response = await GETNETWORK(Url, true);
      
      if (response && response.data) {
        const vehicles = response.data?.things || [];
        const mappedItems = vehicles.map(item => ({
          label: item.thing_name,
          value: item.thing_id,
        }));
        
        setVehicleItems(mappedItems);
        showToast('success', 'Vehicles Loaded', `${vehicles.length} vehicles loaded`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      showToast('error', 'Load Failed', 'Failed to fetch vehicle data');
      
      // Show detailed error for debugging
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {
      date: '',
      vehicle: '',
      maintenanceType: '',
      comments: '',
    };

    let isValid = true;

    // Date validation
    if (!selectedDate) {
      errors.date = 'Please select a date';
      isValid = false;
    } else if (moment(selectedDate).isBefore(moment(), 'day')) {
      errors.date = 'Cannot schedule maintenance for past dates';
      isValid = false;
    } else if (moment(selectedDate).isAfter(moment().add(1, 'year'))) {
      errors.date = 'Cannot schedule maintenance more than 1 year in advance';
      isValid = false;
    }

    // Vehicle validation
    if (!vehicleValue) {
      errors.vehicle = 'Please select a vehicle';
      isValid = false;
    }

    // Maintenance type validation
    if (!maintenanceValue) {
      errors.maintenanceType = 'Please select maintenance type';
      isValid = false;
    }

    // Comments validation (optional field, but with length check)
    if (comments.length > 500) {
      errors.comments = 'Comments cannot exceed 500 characters';
      isValid = false;
    }

    setValidationErrors(errors);

    if (!isValid) {
      // Show first error in toast
      const firstError = Object.values(errors).find(error => error !== '');
      if (firstError) {
        showToast('error', 'Validation Error', firstError);
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
      const maintenanceData = {
        thing_id: vehicleValue,
        maintenance_id: maintenanceValue,
        scheduled_date: selectedDate,
        remarks: comments || 'No remarks',
        scheduled_timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      };

      const response = await POSTNETWORK(
        `${BASE_URL}maintenance/maintenance_schedule/`,
        maintenanceData,
        true,
      );

      // Enhanced success response handling
      if (response) {
        if (response.success === false) {
          throw new Error(response.message || 'Server returned unsuccessful response');
        }

        if (response.data || response.id) {
          // Success case - maintenance scheduled
          showToast('success', 'Success', 'Maintenance scheduled successfully!');
          
          // Optional: Show confirmation dialog with details
          Alert.alert(
            'Schedule Confirmed',
            `Maintenance has been scheduled for ${moment(selectedDate).format('DD MMM YYYY')}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  resetForm();
                  // Optional: Navigate to maintenance list or dashboard
                  // navigation.navigate('MaintenanceList');
                }
              }
            ]
          );
        } else {
          // Handle ambiguous response
          console.warn('Unexpected response format:', response);
          showToast('success', 'Schedule Submitted', 'Your maintenance schedule has been submitted');
          resetForm();
        }
      } else {
        throw new Error('No response received from server');
      }

    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Failed to schedule maintenance. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.error;
        
        switch (status) {
          case 400:
            errorMessage = serverMessage || 'Invalid data submitted. Please check your entries.';
            break;
          case 401:
            errorMessage = 'Authentication failed. Please login again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to schedule maintenance.';
            break;
          case 409:
            errorMessage = serverMessage || 'Maintenance already scheduled for this vehicle on the selected date.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = serverMessage || `Server error (${status}). Please try again.`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        // Other errors
        errorMessage = error.message || 'An unexpected error occurred.';
      }

      showToast('error', 'Submission Failed', errorMessage);
      
      // Optional: Show detailed error in alert for important errors
      if (error.response?.status >= 500) {
        Alert.alert(
          'Server Error',
          'Please try again later or contact support if the problem persists.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // Handle comments change with validation
  const handleCommentsChange = (text) => {
    if (text.length <= 500) {
      setComments(text);
      if (text.length === 500) {
        showToast('warning', 'Character Limit', 'Maximum 500 characters reached');
      }
    }
    clearValidationError('comments');
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {/* Date & Vehicle ID Row */}
          <View style={styles.inputRow}>
            {/* Date Button */}
            <View style={styles.inputItem}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  validationErrors.date && styles.errorBorder
                ]}
                onPress={() => setShowCalendar(true)}>
                <Text style={[
                  styles.dateButtonText,
                  !selectedDate && styles.placeholderText
                ]}>
                  {selectedDate ? moment(selectedDate).format('DD MMM YYYY') : 'Select Date'}
                </Text>
              </TouchableOpacity>
              {validationErrors.date ? (
                <Text style={styles.errorText}>{validationErrors.date}</Text>
              ) : null}
            </View>

            {/* Vehicle Dropdown */}
            <View style={[styles.inputItem, {zIndex: vehicleOpen ? zIndexCounter.current + 1 : 1}]}>
              <Text style={styles.label}>Vehicle *</Text>
              <DropDownPicker
                open={vehicleOpen}
                value={vehicleValue}
                items={vehicleItems}
                searchable={true}
                searchablePlaceholder="Search vehicle..."
                setOpen={handleVehicleDropdownOpen}
                setValue={setVehicleValue}
                setItems={setVehicleItems}
                placeholder="Select Vehicle"
                style={[
                  styles.dropdown,
                  validationErrors.vehicle && styles.errorBorder
                ]}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                listMode="MODAL"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                maxHeight={200}
                autoScroll={true}
              />
              {validationErrors.vehicle ? (
                <Text style={styles.errorText}>{validationErrors.vehicle}</Text>
              ) : null}
            </View>
          </View>

          {/* Maintenance Type Dropdown */}
          <View style={[styles.inputItem, {zIndex: maintenanceOpen ? zIndexCounter.current + 1 : 1}]}>
            <Text style={styles.label}>Maintenance Type *</Text>
            <DropDownPicker
              open={maintenanceOpen}
              value={maintenanceValue}
              items={maintenanceItems}
              setOpen={handleMaintenanceDropdownOpen}
              setValue={setMaintenanceValue}
              setItems={setMaintenanceItems}
              placeholder="Select Maintenance Type"
              searchable={true}
              searchablePlaceholder="Search maintenance type..."
              style={[
                styles.dropdown,
                validationErrors.maintenanceType && styles.errorBorder
              ]}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              listMode="MODAL"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
              maxHeight={200}
              autoScroll={true}
            />
            {validationErrors.maintenanceType ? (
              <Text style={styles.errorText}>{validationErrors.maintenanceType}</Text>
            ) : null}
          </View>

          {/* Comments */}
          <View style={styles.inputItem}>
            <Text style={styles.label}>Comments</Text>
            <View style={styles.commentsContainer}>
              <TextInput
                style={[
                  styles.input, 
                  styles.multilineInput,
                  validationErrors.comments && styles.errorBorder
                ]}
                placeholderTextColor={'#9ca3af'}
                placeholder="Enter any additional comments (optional)"
                value={comments}
                onChangeText={handleCommentsChange}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={[
                styles.charCount,
                comments.length === 500 && styles.charCountWarning
              ]}>
                {comments.length}/500
              </Text>
            </View>
            {validationErrors.comments ? (
              <Text style={styles.errorText}>{validationErrors.comments}</Text>
            ) : null}
          </View>

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
                <Text style={styles.submitButtonText}>Schedule Maintenance</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Summary */}
          {(selectedDate || vehicleValue || maintenanceValue) && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Schedule Summary</Text>
              {selectedDate && (
                <Text style={styles.summaryText}>
                  📅 Date: {moment(selectedDate).format('DD MMM YYYY')}
                </Text>
              )}
              {vehicleValue && (
                <Text style={styles.summaryText}>
                  🚗 Vehicle: {vehicleItems.find(v => v.value === vehicleValue)?.label}
                </Text>
              )}
              {maintenanceValue && (
                <Text style={styles.summaryText}>
                  🔧 Type: {maintenanceItems.find(m => m.value === maintenanceValue)?.label}
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        {/* Calendar Modal */}
        <Modal visible={showCalendar} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.calendarContainer}>
              <Text style={styles.calendarTitle}>Select Schedule Date</Text>
              <Calendar
                onDayPress={handleDayPress}
                markedDates={{
                  [selectedDate]: {
                    selected: true, 
                    selectedColor: '#0284c7',
                    selectedTextColor: '#fff'
                  },
                }}
                minDate={moment().format('YYYY-MM-DD')}
                maxDate={moment().add(1, 'year').format('YYYY-MM-DD')}
                theme={{
                  todayTextColor: '#0284c7',
                  arrowColor: '#0284c7',
                  selectedDayBackgroundColor: '#0284c7',
                  selectedDayTextColor: '#fff',
                }}
              />
              <View style={styles.calendarButtons}>
                <TouchableOpacity
                  style={[styles.calendarButton, styles.closeCalendarButton]}
                  onPress={() => {
                    setShowCalendar(false);
                    showToast('info', 'Calendar Closed', 'Date selection cancelled');
                  }}
                >
                  <Text style={styles.closeCalendarButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calendarButton, styles.confirmCalendarButton]}
                  onPress={() => setShowCalendar(false)}
                >
                  <Text style={styles.confirmCalendarButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        <Loader visible={loading} />
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
    padding: 20,
    paddingBottom: 40,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  inputItem: {
    flex: 1,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    color: '#111827',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
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
  charCountWarning: {
    color: '#dc2626',
    fontWeight: '600',
  },
  dateButton: {
    height: 48,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  dateButtonText: {
    color: '#374151',
    fontSize: 14,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderWidth: 1.5,
    borderRadius: 8,
    height: 48,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderWidth: 1.5,
    borderRadius: 8,
    marginTop: 2,
  },
  dropdownText: {
    fontSize: 14,
    color: '#111827',
  },
  dropdownPlaceholder: {
    color: '#9ca3af',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
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
    fontSize: 14,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0284c7',
    textAlign: 'center',
    marginBottom: 16,
  },
  calendarButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  calendarButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeCalendarButton: {
    backgroundColor: '#6b7280',
  },
  confirmCalendarButton: {
    backgroundColor: '#0284c7',
  },
  closeCalendarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmCalendarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  errorBorder: {
    borderColor: '#dc2626',
  },
});

export default MaintenanceScheduleScreen;