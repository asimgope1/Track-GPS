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
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Header from '../../components/Header';
import {Calendar} from 'react-native-calendars';
import { BASE_URL } from '../../constants/url';
import { GETNETWORK, POSTNETWORK } from '../../utils/Network';
import { useFocusEffect } from '@react-navigation/native';
import { Loader } from '../../components/Loader';

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

const VehicleInspection = ({
  navigation,

}) => {
  const [inspectorName, setInspectorName] = useState('');
  const [comments, setComments] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [inspectionResults, setInspectionResults] = useState({});
  const [selectedStatusDetails, setSelectedStatusDetails] = useState({});
    const [statusOptions, setStatusOptions] = useState(DEFAULT_STATUS_OPTIONS);
    const [inspectionItems, setInspectionItems] = useState(
      DEFAULT_INSPECTION_ITEMS,
    );
  const [loading,SetLoading]=useState(false)


  // Vehicle Dropdown
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vehicleValue, setVehicleValue] = useState('');
  const [vehicleItems, setVehicleItems] = useState([
    {label: 'TRK-001', value: 'TRK-001'},
    {label: 'TRK-002', value: 'TRK-002'},
    {label: 'TRK-003', value: 'TRK-003'},
    {label: 'TRK-004', value: 'TRK-004'},
  ]);

  // Status dropdowns for each item
  const [openDropdowns, setOpenDropdowns] = useState({});
  const zIndexCounter = useRef(1000); // Base z-index counter

  const handleDayPress = day => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
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
    } catch (error) {
      console.error('Failed to fetch checklist/status', error);
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
  },
  [statusOptions],
);

useFocusEffect(
  useCallback(() => {
    // Reset z-index counter when component is focused
    zIndexCounter.current = 1000;

    // fetch vehicle data when component is focused
    GetVehicle();

    // reset openDropdowns and states
    setOpenDropdowns({});
    setComments('');
    setSelectedDate('');
    setVehicleValue(null);
    setInspectorName('');
    setInspectionResults({});
    setSelectedStatusDetails({});
    setVehicleOpen(false);
    setVehicleItems([]);



    return () => {

      // Reset z-index counter when component is unfocused
      zIndexCounter.current = 1000;
    };
  }, []),
);



const GetVehicle = async () => {
  SetLoading(true)
  const Url = `${BASE_URL}projects/117/things/?page=1&search=`;

  try {
    const response = await GETNETWORK(Url, true);
    console.log('Vehicle Data:', response.data);

    const vehicles = response.data?.things || [];

    const mappedItems = vehicles.map(item => ({
      label: item.thing_name,
      value: item.thing_id,
    }));
SetLoading(false)
    setVehicleItems(mappedItems);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    alert('Failed to fetch vehicle data. Please try again.');
    SetLoading(false)
  }
};




const handleSubmit = async () => {
  const payload = {
    thing_id: vehicleValue, // vehicle ID
    creation_date: selectedDate, // format: 'YYYY-MM-DD'
    inpector_name: inspectorName,
    comments: comments?.trim() || '',
    details: Object.entries(inspectionResults).map(
      ([checklistId, selectedValue]) => ({
        checklist_master_id: parseInt(checklistId),
        selected_value: selectedValue,
      }),
    ),
  };

  console.log(
    'Inspection Checklist Payload:',
    JSON.stringify(payload, null, 2),
  );

  SetLoading(true)

  try {
    const response = await POSTNETWORK(
      `${BASE_URL}maintenance/inspection_checklist/`,
      payload,
      true, // include auth token
    );

    console.log('Inspection submission response:', response);
    SetLoading(false)

    if (response && response.success !== false) {
      alert('✅ Inspection submitted successfully.');

      // Clear all states after submission
      setSelectedDate('');
      setVehicleValue(null);
      setInspectorName('');
      setComments('');
      setInspectionResults({});
      setSelectedStatusDetails({});
      setOpenDropdowns({});
    } else {
      alert(response?.message || '⚠️ Failed to submit inspection.');
      SetLoading(false)
    }
  } catch (error) {
    console.error('Error submitting inspection:', error);
    SetLoading(false)
    alert('❌ Error submitting inspection. Please try again.');
  }
};



  const renderItem = ({item}) => {
    const selectedStatus = inspectionResults[item.id];
    const selectedStatusObj = statusOptions.find(
      opt => opt.value === selectedStatus,
    );
    const isOpen = openDropdowns[item.id] || false;
    const zIndex = isOpen ? zIndexCounter.current : 1;

    console.log(
      'selectedStatusObj:',
      selectedStatusObj,
      'selectedStatus',
      selectedStatus,
    );

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
          />
        </View>
      </View>
    );
  };

  return (
    <>
      <StatusBar backgroundColor={'#0284c7'} barStyle="light-content" />
      <Header
        onMenuPress={() => navigation.openDrawer()}
        title="Vehicle Inspection"
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          {/* Input Section */}
          <View style={styles.inputRow}>
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

            <View
              style={[
                styles.inputItem,
                {zIndex: vehicleOpen ? zIndexCounter.current + 100 : 1},
              ]}>
              <Text style={styles.label}>Vehicle</Text>
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
              />
            </View>
          </View>

          <View style={styles.inputItem}>
            <Text style={styles.label}>Inspector</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={'#9ca3af'}
              placeholder="Inspector Name"
              value={inspectorName}
              onChangeText={setInspectorName}
            />
          </View>

          {/* comment input */}
          <View style={{...styles.inputItem}}>
            <Text style={styles.label}>Comments</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={'#9ca3af'}
              placeholder="Enter any comments"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              value={comments}
              onChangeText={setComments}
            />
          </View>

          {/* Calendar Modal */}
          <Modal
            visible={showCalendar}
            transparent={true}
            animationType="slide">
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

          {/* Checklist Section */}
          <Text style={styles.sectionHeader}>Checklist</Text>

          <View style={styles.tableContainer}>
            <FlatList
              data={inspectionItems}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Inspection</Text>
          </TouchableOpacity>
        </ScrollView>
        <Loader visible={loading} />
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
  },
  dateButtonText: {
    color: '#374151',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    marginTop: 10,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
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
    borderRadius: 6,
    height: 40,
    minHeight: 40,
    paddingHorizontal: 10,
  },
  statusDropdownList: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    marginTop: 2,
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

export default VehicleInspection;
