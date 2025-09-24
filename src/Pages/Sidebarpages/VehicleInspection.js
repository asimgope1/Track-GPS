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
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Header from '../../components/Header';
import {Calendar} from 'react-native-calendars';
import { BASE_URL } from '../../constants/url';
import { GETNETWORK, POSTNETWORK } from '../../utils/Network';
import { useFocusEffect } from '@react-navigation/native';
import { Loader } from '../../components/Loader';
import Toast from 'react-native-toast-message';
import moment from 'moment';

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
      topOffset: StatusBar.currentHeight || 40,
    });
  };

  const handleDayPress = day => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
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
    if (!selectedDate) {
      showToast('error', 'Validation Error', 'Please select inspection date');
      return false;
    }
    
    if (!vehicleValue) {
      showToast('error', 'Validation Error', 'Please select a vehicle');
      return false;
    }
    
    if (!inspectorName?.trim()) {
      showToast('error', 'Validation Error', 'Please enter inspector name');
      return false;
    }

    // Check if all inspection items have status selected
    const incompleteItems = inspectionItems.filter(item => !inspectionResults[item.id]);
    if (incompleteItems.length > 0) {
      showToast('error', 'Validation Error', `Please select status for all ${incompleteItems.length} items`);
      return false;
    }

    // Check if selected date is not in the future
    if (moment(selectedDate).isAfter(moment(), 'day')) {
      showToast('error', 'Validation Error', 'Cannot schedule inspection for future dates');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

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
        showToast('success', 'Success', 'Vehicle inspection submitted successfully!');
        resetForm();
      } else {
        throw new Error(response?.message || 'Failed to submit inspection');
      }
    } catch (error) {
      console.error('Error submitting inspection:', error);
      showToast('error', 'Submission Failed', error.message || 'Failed to submit inspection');
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

    return (
      <View style={[styles.tableRow, {zIndex}]}>
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
      <StatusBar backgroundColor={'#0284c7'} barStyle="light-content" />
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
                }}
                setValue={setVehicleValue}
                setItems={setVehicleItems}
                placeholder="Select Vehicle"
                searchable={true}
                searchablePlaceholder="Search vehicle..."
                style={styles.dropdown}
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
            </View>
          </View>

          <View style={styles.inputItem}>
            <Text style={styles.label}>Inspector Name *</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={'#9ca3af'}
              placeholder="Enter inspector name"
              value={inspectorName}
              onChangeText={setInspectorName}
              maxLength={100}
            />
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
                      selectedColor: '#0284c7',
                      selectedTextColor: '#fff'
                    },
                  }}
                  maxDate={moment().format('YYYY-MM-DD')}
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
                <ActivityIndicator color="#fff" size="small" />
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
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0284c7',
    borderRadius: 3,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
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
    color: '#111827',
    height: 45,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
    paddingBottom: 25,
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
    paddingHorizontal: 10,
  },
  dateButtonText: {
    color: '#374151',
    textAlign: 'center',
    fontSize: 14,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubHeader: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    paddingBottom: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
    minHeight: 60,
  },
  itemNameContainer: {
    width: Dimensions.get('window').width * 0.5,
  },
  itemName: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  selectedStatusText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  statusDropdownContainer: {
    flex: 1,
  },
  statusDropdown: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderWidth: 1.5,
    borderRadius: 6,
    height: 40,
    minHeight: 40,
    paddingHorizontal: 10,
  },
  statusDropdownText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusDropdownPlaceholder: {
    color: '#9ca3af',
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
    gap: 16,
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendLabel: {
    fontSize: 13,
    color: '#374151',
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 20,
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
});

export default VehicleInspection;