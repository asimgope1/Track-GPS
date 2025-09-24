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
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import {Calendar} from 'react-native-calendars';
import Header from '../../components/Header';
import {GETNETWORK, POSTNETWORK} from '../../utils/Network';
import {BASE_URL} from '../../constants/url';
import { Loader } from '../../components/Loader';
import Toast from 'react-native-toast-message';
import moment from 'moment';

const MaintenanceScheduleScreen = () => {
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
      topOffset: StatusBar.currentHeight || 40,
    });
  };

  // Optimized dropdown handlers
  const handleVehicleDropdownOpen = (open) => {
    setVehicleOpen(open);
    if (open) setMaintenanceOpen(false);
  };

  const handleMaintenanceDropdownOpen = (open) => {
    setMaintenanceOpen(open);
    if (open) setVehicleOpen(false);
  };

  const handleDayPress = day => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
    showToast('success', 'Date Selected', moment(day.dateString).format('DD MMM YYYY'));
  };

  const resetForm = () => {
    setSelectedDate('');
    setVehicleValue(null);
    setMaintenanceValue(null);
    setComments('');
    setVehicleOpen(false);
    setMaintenanceOpen(false);
    
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
      };
    }, []),
  );

  const GetMaintenance = async () => {
    if (loading) return;
    
    setLoading(true);
    const Url = `${BASE_URL}maintenance/maintenance_master/`;
    
    try {
      const response = await GETNETWORK(Url, true);
      const mappedItems = response.data.map(item => ({
        label: item.maintenance_name,
        value: item.maintenance_id,
      }));
      
      setMaintenanceItems(mappedItems);
      showToast('success', 'Maintenance Types Loaded', `${response.data.length} types loaded`);
    } catch (error) {
      console.error('Error fetching maintenance:', error);
      showToast('error', 'Load Failed', 'Failed to fetch maintenance data');
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
      const vehicles = response.data?.things || [];
      const mappedItems = vehicles.map(item => ({
        label: item.thing_name,
        value: item.thing_id,
      }));
      
      setVehicleItems(mappedItems);
      showToast('success', 'Vehicles Loaded', `${vehicles.length} vehicles loaded`);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      showToast('error', 'Load Failed', 'Failed to fetch vehicle data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!selectedDate) {
      showToast('error', 'Validation Error', 'Please select a date');
      return false;
    }
    
    if (!vehicleValue) {
      showToast('error', 'Validation Error', 'Please select a vehicle');
      return false;
    }
    
    if (!maintenanceValue) {
      showToast('error', 'Validation Error', 'Please select maintenance type');
      return false;
    }

    // Check if selected date is not in the past
    if (moment(selectedDate).isBefore(moment(), 'day')) {
      showToast('error', 'Validation Error', 'Cannot schedule maintenance for past dates');
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
      };

      const response = await POSTNETWORK(
        `${BASE_URL}maintenance/maintenance_schedule/`,
        maintenanceData,
        true,
      );

      if (response && response.success !== false) {
        showToast('success', 'Success', 'Maintenance scheduled successfully!');
        resetForm();
      } else {
        throw new Error(response?.message || 'Failed to schedule maintenance');
      }
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      showToast('error', 'Submission Failed', error.message || 'Failed to schedule maintenance');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
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
                style={styles.dateButton}
                onPress={() => setShowCalendar(true)}>
                <Text style={[
                  styles.dateButtonText,
                  !selectedDate && styles.placeholderText
                ]}>
                  {selectedDate ? moment(selectedDate).format('DD MMM YYYY') : 'Select Date'}
                </Text>
              </TouchableOpacity>
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
                style={styles.dropdown}
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
              style={styles.dropdown}
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
          </View>

          {/* Comments */}
          <View style={styles.inputItem}>
            <Text style={styles.label}>Comments</Text>
            <View style={styles.commentsContainer}>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholderTextColor={'#9ca3af'}
                placeholder="Enter any additional comments (optional)"
                value={comments}
                onChangeText={setComments}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={styles.charCount}>
                {comments.length}/500
              </Text>
            </View>
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
});

export default MaintenanceScheduleScreen;