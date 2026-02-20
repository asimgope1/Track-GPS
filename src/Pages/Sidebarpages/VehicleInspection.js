import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  FlatList,
  Platform,
  Dimensions,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Header from '../../components/Header';
import {Calendar} from 'react-native-calendars';
import { useStatusBarHeight } from '../../constants/config';
import { BASE_URL } from '../../constants/url';
import { GETNETWORK, POSTNETWORK } from '../../utils/Network';
import { useFocusEffect } from '@react-navigation/native';
import { Loader } from '../../components/Loader';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import theme from '../../theme';

const DEFAULT_STATUS_OPTIONS = [
  {label: 'OK', value: 'OK', color: '#22c55e'},
  {label: 'Attention', value: 'Attention', color: '#eab308'},
  {label: 'Replace', value: 'Replace', color: '#ef4444'},
];

const DEFAULT_INSPECTION_ITEMS = [
  {id: 1, name: 'Tires (Pressure & Tread)'},
  {id: 2, name: 'Lights (All functions)'},
  {id: 3, name: 'Brakes'},
  {id: 4, name: 'Fluid Levels'},
  {id: 5, name: 'Windshield/Wipers'},
  {id: 6, name: 'Mirrors'},
  {id: 7, name: 'Seat Belts'},
  {id: 8, name: 'Emergency Kit'},
];

const VehicleInspection = ({ navigation }) => {
  const statusBarHeight = useStatusBarHeight();
  const [inspectorName, setInspectorName] = useState('');
  const [comments, setComments] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [inspectionResults, setInspectionResults] = useState({});
  const [selectedStatusDetails, setSelectedStatusDetails] = useState({});
  const [statusOptions, setStatusOptions] = useState(DEFAULT_STATUS_OPTIONS);
  const [inspectionItems, setInspectionItems] = useState(DEFAULT_INSPECTION_ITEMS);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Vehicle Dropdown
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vehicleValue, setVehicleValue] = useState(null);
  const [vehicleItems, setVehicleItems] = useState([]);

  // Status dropdowns for each item
  const [openDropdowns, setOpenDropdowns] = useState({});
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

  const handleDayPress = day => {
    const selectedMoment = moment(day.dateString);
    const today = moment().startOf('day');
    
    // Allow today and future dates only
    if (selectedMoment.isBefore(today)) {
      showToast('error', 'Invalid Date', 'Cannot select past dates. Please choose today or a future date.');
      return;
    }

    setSelectedDate(day.dateString);
    setShowCalendar(false);
    
    // Clear date error if any
    setFormErrors(prev => ({...prev, date: null}));
    
    showToast('success', 'Date Selected', moment(day.dateString).format('DD MMM YYYY'));
  };

  const toggleDropdown = useCallback(itemId => {
    setOpenDropdowns(prev => {
      const newState = {};
      // Close all other dropdowns
      Object.keys(prev).forEach(id => {
        newState[id] = false;
      });
      // Toggle current dropdown
      newState[itemId] = !prev[itemId];
      return newState;
    });
    // Increment z-index when opening a dropdown
    zIndexCounter.current += 10;
  }, []);

  useEffect(() => {
    fetchChecklistAndStatus();
  }, []);

  const fetchChecklistAndStatus = async () => {
    const Url = `${BASE_URL}maintenance/checklist/`;
    try {
      setLoading(true);
      const response = await GETNETWORK(Url, true);
      console.log('checklist Data:', response.data);

      const data = response?.data || [];

      // Extract statusOptions (unique keys from checklist_value)
      const rawStatus = data.flatMap(item =>
        item.checklist_value.map(cv => cv.key),
      );
      const uniqueStatus = [
        ...new Set(rawStatus.map(key => key.toLowerCase())),
      ];

      const statusOptionMapped = uniqueStatus.map(key => ({
        label: capitalize(key),
        value: key,
        color: getStatusColor(key),
      }));

      // Extract inspection items (name & id)
      const inspectionMapped = data.map(item => ({
        id: item.id,
        name: item.checklist_name,
      }));

      setStatusOptions(statusOptionMapped);
      setInspectionItems(inspectionMapped);
      showToast('success', 'Checklist Loaded', `${inspectionMapped.length} items loaded`);
    } catch (error) {
      console.error('Failed to fetch checklist/status', error);
      showToast('error', 'Load Failed', 'Failed to fetch inspection checklist');
    } finally {
      setLoading(false);
    }
  };

  const capitalize = str =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const getStatusColor = key => {
    const lower = key.toLowerCase();
    if (lower === 'ok') return '#22c55e';
    if (lower === 'attention' || lower === 'repair') return '#eab308';
    if (lower === 'replace') return '#ef4444';
    return '#94a3b8'; // default gray
  };

  const handleStatusSelect = useCallback(
    (itemId, value) => {
      const selectedStatus = statusOptions.find(status => status.value === value);

      setInspectionResults(prev => ({
        ...prev,
        [itemId]: value,
      }));

      setSelectedStatusDetails(prev => ({
        ...prev,
        [itemId]: selectedStatus || {},
      }));

      setOpenDropdowns(prev => ({
        ...prev,
        [itemId]: false,
      }));

      // Clear error for this item if any
      setFormErrors(prev => ({...prev, [itemId]: null}));

      showToast('success', 'Status Updated', `${selectedStatus?.label} selected`);
    },
    [statusOptions],
  );

  const resetForm = () => {
    setSelectedDate('');
    setVehicleValue(null);
    setInspectorName('');
    setComments('');
    setInspectionResults({});
    setSelectedStatusDetails({});
    setOpenDropdowns({});
    setVehicleOpen(false);
    setFormErrors({});
    showToast('info', 'Form Reset', 'All fields have been cleared');
  };

  useFocusEffect(
    useCallback(() => {
      // Reset z-index counter when component is focused
      zIndexCounter.current = 1000;

      // fetch vehicle data when component is focused
      GetVehicle();

      // reset form
      resetForm();

      return () => {
        // Reset z-index counter when component is unfocused
        zIndexCounter.current = 1000;
      };
    }, []),
  );

  const GetVehicle = async () => {
    if (loading) return;
    
    setLoading(true);
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
      showToast('success', 'Vehicles Loaded', `${vehicles.length} vehicles loaded`);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      showToast('error', 'Load Failed', 'Failed to fetch vehicle data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Date validation - must be today or future
    if (!selectedDate) {
      errors.date = 'Please select inspection date';
    } else if (moment(selectedDate).isBefore(moment(), 'day')) {
      errors.date = 'Cannot select past dates. Please choose today or a future date.';
    }
    
    // Vehicle validation
    if (!vehicleValue) {
      errors.vehicle = 'Please select a vehicle';
    }
    
    // Inspector name validation
    if (!inspectorName?.trim()) {
      errors.inspectorName = 'Please enter inspector name';
    } else if (inspectorName.trim().length < 2) {
      errors.inspectorName = 'Inspector name must be at least 2 characters long';
    }

    // Inspection items validation
    const incompleteItems = inspectionItems.filter(item => !inspectionResults[item.id]);
    if (incompleteItems.length > 0) {
      incompleteItems.forEach(item => {
        errors[item.id] = 'Please select status';
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('error', 'Validation Error', 'Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    const payload = {
      thing_id: vehicleValue,
      creation_date: selectedDate,
      inpector_name: inspectorName.trim(),
      comments: comments?.trim() || '',
      details: Object.entries(inspectionResults).map(
        ([checklistId, selectedValue]) => ({
          checklist_master_id: parseInt(checklistId),
          selected_value: selectedValue,
        }),
      ),
    };

    console.log('Inspection Checklist Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await POSTNETWORK(
        `${BASE_URL}maintenance/inspection_checklist/`,
        payload,
        true,
      );

      console.log('Inspection submission response:', response);

      if (response && response.success !== false) {
        // Show success alert with options
        Alert.alert(
          'Success!',
          'Vehicle inspection submitted successfully!',
          [
            {
              text: 'Submit Another',
              onPress: () => {
                resetForm();
                showToast('success', 'Ready', 'You can now submit another inspection');
              },
            },
            {
              text: 'View Inspections',
              onPress: () => {
                // Navigate to inspections list if available, or go back
                navigation.goBack();
              },
            },
          ],
          { cancelable: false }
        );
        
        showToast('success', 'Submission Successful', 'Inspection data saved successfully');
      } else {
        throw new Error(response?.message || 'Failed to submit inspection');
      }
    } catch (error) {
      console.error('Error submitting inspection:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to submit inspection. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 400) {
          errorMessage = 'Invalid data submitted. Please check your inputs.';
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      Alert.alert(
        'Submission Failed',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
      
      showToast('error', 'Submission Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const renderItem = ({item}) => {
    const selectedStatus = inspectionResults[item.id];
    const selectedStatusObj = statusOptions.find(
      opt => opt.value === selectedStatus,
    );
    const isOpen = openDropdowns[item.id] || false;
    const zIndex = isOpen ? zIndexCounter.current : 1;
    const hasError = formErrors[item.id];

    return (
      <View style={[styles.tableRow, {zIndex}, hasError && styles.errorRow]}>
        <View style={styles.itemNameContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          {selectedStatus && (
            <Text
              style={[
                styles.selectedStatusText,
                {color: selectedStatusObj?.color},
              ]}>
              {selectedStatusObj?.label}
            </Text>
          )}
          {hasError && (
            <Text style={styles.errorText}>{formErrors[item.id]}</Text>
          )}
        </View>

        <View
          style={[
            styles.statusDropdownContainer,
            {zIndex: isOpen ? zIndex + 1 : 1},
          ]}>
          <DropDownPicker
            open={isOpen}
            value={selectedStatus}
            items={statusOptions}
            setOpen={callback => {
              const value =
                typeof callback === 'function'
                  ? callback(openDropdowns[item.id])
                  : callback;
              setOpenDropdowns(prev => ({
                ...prev,
                [item.id]: value,
              }));
            }}
            setValue={callback => {
              const selectedValue =
                typeof callback === 'function'
                  ? callback(selectedStatus)
                  : callback;
              handleStatusSelect(item.id, selectedValue);
            }}
            setItems={() => {}}
            placeholder="Select Status"
            style={[
              styles.statusDropdown,
              selectedStatusObj && {
                backgroundColor: selectedStatusObj.color + '20',
              },
              hasError && styles.errorInput,
            ]}
            textStyle={styles.statusDropdownText}
            placeholderStyle={styles.statusDropdownPlaceholder}
            labelStyle={selectedStatusObj && {color: selectedStatusObj.color}}
            listItemLabelStyle={item => ({
              color: item.color,
              fontWeight: '600',
            })}
            searchable={true}
            searchablePlaceholder="Search status..."
            showTickIcon={false}
            listMode="MODAL"
            modalProps={{
              animationType: 'fade',
            }}
            ArrowDownIconComponent={() => (
              <View
                style={[
                  styles.statusIndicator,
                  selectedStatusObj && {
                    backgroundColor: selectedStatusObj.color,
                  },
                ]}
              />
            )}
            zIndex={isOpen ? zIndex + 3 : 1}
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            maxHeight={200}
            autoScroll={true}
          />
        </View>
      </View>
    );
  };

  const completedItemsCount = Object.keys(inspectionResults).length;
  const totalItemsCount = inspectionItems.length;

  return (
    <>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      <Header
        onMenuPress={() => navigation.openDrawer()}
        title="Vehicle Inspection"
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
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Inspection Progress: {completedItemsCount}/{totalItemsCount} items
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  {width: `${(completedItemsCount / totalItemsCount) * 100}%`}
                ]} 
              />
            </View>
          </View>

          {/* Input Section */}
          <View style={styles.inputRow}>
            <View style={styles.inputItem}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  formErrors.date && styles.errorInput
                ]}
                onPress={() => setShowCalendar(true)}>
                <Text style={[
                  styles.dateButtonText,
                  !selectedDate && styles.placeholderText
                ]}>
                  {selectedDate ? moment(selectedDate).format('DD MMM YYYY') : 'Select Date'}
                </Text>
              </TouchableOpacity>
              {formErrors.date && (
                <Text style={styles.errorText}>{formErrors.date}</Text>
              )}
            </View>

            <View
              style={[
                styles.inputItem,
                {zIndex: vehicleOpen ? zIndexCounter.current + 100 : 1},
              ]}>
              <Text style={styles.label}>Vehicle *</Text>
              <DropDownPicker
                open={vehicleOpen}
                value={vehicleValue}
                items={vehicleItems}
                setOpen={open => {
                  setVehicleOpen(open);
                  if (open) {
                    // Close all status dropdowns when vehicle dropdown opens
                    setOpenDropdowns({});
                    zIndexCounter.current += 200;
                  }
                  // Clear error when dropdown is opened
                  if (formErrors.vehicle) {
                    setFormErrors(prev => ({...prev, vehicle: null}));
                  }
                }}
                setValue={setVehicleValue}
                setItems={setVehicleItems}
                placeholder="Select Vehicle"
                  listMode="MODAL"
                searchable={true}
                searchablePlaceholder="Search vehicle..."
                style={[
                  styles.dropdown,
                  formErrors.vehicle && styles.errorInput
                ]}
                dropDownContainerStyle={[
                  styles.dropdownContainer,
                  {zIndex: vehicleOpen ? zIndexCounter.current + 101 : 1},
                ]}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                modalProps={{
                  animationType: 'slide',
                }}
                modalContentContainerStyle={styles.modalContent}
                modalTitle="Select Vehicle"
                modalTitleStyle={styles.modalTitle}
                zIndex={vehicleOpen ? zIndexCounter.current + 102 : 1}
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                maxHeight={200}
                autoScroll={true}
              />
              {formErrors.vehicle && (
                <Text style={styles.errorText}>{formErrors.vehicle}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputItem}>
            <Text style={styles.label}>Inspector Name *</Text>
            <TextInput
              style={[
                styles.input,
                formErrors.inspectorName && styles.errorInput
              ]}
              placeholderTextColor={'#9ca3af'}
              placeholder="Enter inspector name"
              value={inspectorName}
              onChangeText={(text) => {
                setInspectorName(text);
                // Clear error when user starts typing
                if (formErrors.inspectorName) {
                  setFormErrors(prev => ({...prev, inspectorName: null}));
                }
              }}
              maxLength={100}
            />
            {formErrors.inspectorName && (
              <Text style={styles.errorText}>{formErrors.inspectorName}</Text>
            )}
          </View>

          {/* comment input */}
          <View style={styles.inputItem}>
            <Text style={styles.label}>Comments</Text>
            <View style={styles.commentsContainer}>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholderTextColor={'#9ca3af'}
                placeholder="Enter any comments (optional)"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                value={comments}
                onChangeText={setComments}
                maxLength={500}
              />
              <Text style={styles.charCount}>
                {comments.length}/500
              </Text>
            </View>
          </View>

          {/* Calendar Modal */}
          <Modal
            visible={showCalendar}
            transparent={true}
            animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.calendarContainer}>
                <Text style={styles.calendarTitle}>Select Inspection Date</Text>
                <Calendar
                  onDayPress={handleDayPress}
                  markedDates={{
                    [selectedDate]: {
                      selected: true, 
                      selectedColor: theme.colors.primary,
                      selectedTextColor: theme.colors.white
                    },
                  }}
                  minDate={moment().format('YYYY-MM-DD')} // Only allow today and future dates
                  theme={{
                    todayTextColor: theme.colors.primary,
                    arrowColor: theme.colors.primary,
                    selectedDayBackgroundColor: theme.colors.primary,
                    selectedDayTextColor: theme.colors.white,
                    textDisabledColor: theme.colors.border,
                  }}
                  // Disable past dates
                  disableAllTouchEventsForDisabledDays={true}
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

          {/* Checklist Section */}
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>Inspection Checklist</Text>
            <Text style={styles.sectionSubHeader}>
              {completedItemsCount}/{totalItemsCount} completed
            </Text>
          </View>

          <View style={styles.tableContainer}>
            <FlatList
              data={inspectionItems}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
            />
          </View>

          {/* Status Legend */}
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Status Legend:</Text>
            {statusOptions.map(status => (
              <View key={status.value} style={styles.legendItem}>
                <View 
                  style={[
                    styles.legendCircle, 
                    {backgroundColor: status.color}
                  ]} 
                />
                <Text style={styles.legendLabel}>{status.label}</Text>
              </View>
            ))}
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
                <Text style={styles.submitButtonText}>
                  Submit Inspection ({completedItemsCount}/{totalItemsCount})
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Inspection Summary */}
          {(selectedDate || vehicleValue || inspectorName) && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Inspection Summary</Text>
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
              {inspectorName && (
                <Text style={styles.summaryText}>
                  👤 Inspector: {inspectorName}
                </Text>
              )}
              <Text style={styles.summaryText}>
                ✅ Completed: {completedItemsCount}/{totalItemsCount} items
              </Text>
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
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  progressText: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  inputItem: {
    flex: 1,
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxs,
  },
  input: {
    color: theme.colors.text,
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    fontSize: theme.typography.sm,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm,
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
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    minHeight: 48,
  },
  dropdownContainer: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    marginTop: theme.spacing.xxs,
  },
  dropdownText: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
  },
  dropdownPlaceholder: {
    color: theme.colors.textPlaceholder,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
  },
  modalTitle: {
    fontWeight: theme.typography.semibold,
  },
  dateButton: {
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
  },
  dateButtonText: {
    color: theme.colors.text,
    textAlign: 'center',
    fontSize: theme.typography.sm,
  },
  placeholderText: {
    color: theme.colors.textPlaceholder,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  sectionHeader: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
  },
  sectionSubHeader: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.semibold,
  },
  tableContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
    minHeight: 56,
  },
  itemNameContainer: {
    width: Dimensions.get('window').width * 0.5,
  },
  itemName: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
  selectedStatusText: {
    marginTop: theme.spacing.xxs,
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.medium,
  },
  statusDropdownContainer: {
    flex: 1,
  },
  statusDropdown: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    minHeight: 44,
    paddingHorizontal: theme.spacing.sm,
  },
  statusDropdownText: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
  },
  statusDropdownPlaceholder: {
    color: theme.colors.textPlaceholder,
  },
  statusIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: theme.spacing.xs,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
    flexWrap: 'wrap',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  legendTitle: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xxs,
  },
  legendCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendLabel: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  calendarContainer: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.lg,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  calendarTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  calendarButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  calendarButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  closeCalendarButton: {
    backgroundColor: theme.colors.textMuted,
  },
  confirmCalendarButton: {
    backgroundColor: theme.colors.primary,
  },
  closeCalendarButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
  },
  confirmCalendarButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  resetButton: {
    backgroundColor: theme.colors.textMuted,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
  },
  summaryContainer: {
    backgroundColor: theme.colors.infoLight,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    marginTop: theme.spacing.sm,
  },
  summaryTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  summaryText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxs,
  },
  errorInput: {
    borderColor: theme.colors.error,
  },
  errorRow: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
    backgroundColor: theme.colors.errorLight,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.xs,
    marginTop: theme.spacing.xxs,
    fontWeight: theme.typography.medium,
  },
});

export default VehicleInspection;