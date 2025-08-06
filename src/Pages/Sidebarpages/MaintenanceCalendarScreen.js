import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import Header from '../../components/Header';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import { BASE_URL } from '../../constants/url';
import { GETNETWORK } from '../../utils/Network';

const {height} = Dimensions.get('window');

const MaintenanceCalendarScreen = () => {
  const navigation = useNavigation();

  const [markedDates, setMarkedDates] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Expanded dummy data with more dates and appointments
  const appointmentData = {
    '2025-08-06': [
      {
        id: 1,
        time: '10:00 AM',
        vehicleId: 'V-001',
        inspector: 'John Doe',
        remarks: 'Oil change and filter replacement',
        status: 'Scheduled',
      },
      {
        id: 2,
        time: '2:00 PM',
        vehicleId: 'V-005',
        inspector: 'Jane Smith',
        remarks: 'Brake system check',
        status: 'Confirmed',
      },
    ],
    '2025-08-08': [
      {
        id: 3,
        time: '9:00 AM',
        vehicleId: 'V-010',
        inspector: 'Mark Lee',
        remarks: 'Full service including fluids check',
        status: 'Scheduled',
      },
      {
        id: 4,
        time: '11:30 AM',
        vehicleId: 'V-007',
        inspector: 'Sarah Johnson',
        remarks: 'Tire rotation and alignment',
        status: 'Pending',
      },
    ],
    '2025-08-10': [
      {
        id: 5,
        time: '8:30 AM',
        vehicleId: 'V-003',
        inspector: 'John Doe',
        remarks: 'Battery replacement',
        status: 'Completed',
      },
      {
        id: 6,
        time: '1:00 PM',
        vehicleId: 'V-008',
        inspector: 'Mike Brown',
        remarks: 'Diagnostic check for engine light',
        status: 'Confirmed',
      },
    ],
    '2025-08-12': [
      {
        id: 7,
        time: '10:45 AM',
        vehicleId: 'V-002',
        inspector: 'Jane Smith',
        remarks: 'Transmission fluid change',
        status: 'Scheduled',
      },
    ],
    '2025-08-15': [
      {
        id: 8,
        time: '3:15 PM',
        vehicleId: 'V-004',
        inspector: 'Mark Lee',
        remarks: 'Coolant system flush',
        status: 'Pending',
      },
    ],
    '2025-08-18': [
      {
        id: 9,
        time: '9:30 AM',
        vehicleId: 'V-006',
        inspector: 'Sarah Johnson',
        remarks: 'Air conditioning service',
        status: 'Scheduled',
      },
      {
        id: 10,
        time: '2:45 PM',
        vehicleId: 'V-009',
        inspector: 'John Doe',
        remarks: 'Suspension inspection',
        status: 'Confirmed',
      },
    ],
  };

  // Filter dropdown states
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [vehicleValue, setVehicleValue] = useState(null);
  const [inspectorValue, setInspectorValue] = useState(null);
  const [statusValue, setStatusValue] = useState(null);
  const [vehicleItems, setVehicleItems] = useState([]);
  const [inspectorItems, setInspectorItems] = useState([]);
  const [statusItems, setStatusItems] = useState([
    {label: 'Scheduled', value: 'Scheduled'},
    {label: 'Confirmed', value: 'Confirmed'},
    {label: 'Pending', value: 'Pending'},
    {label: 'Completed', value: 'Completed'},
  ]);


  useFocusEffect(
    useCallback(() => {
      // Reset all form fields
      setVehicleValue(null);
      setInspectorValue(null);
      setStatusValue(null);
      setVehicleOpen(false);


      // Optional cleanup
      return () => {
        // any cleanup if needed
      };
    }, []),
  );

  useEffect(() => {
    // Fetch vehicle data when component mounts
    GetVehicle();

  }, []);


  // Initialize marked dates and dropdown items
  useEffect(() => {
    const marked = {};
    Object.keys(appointmentData).forEach(date => {
      marked[date] = {
        marked: true,
        dotColor: '#0284c7',
        selectedColor: '#bae6fd',
      };
    });
    setMarkedDates(marked);

    // Get unique vehicles and inspectors from all appointments
    const uniqueVehicles = new Set();
    const uniqueInspectors = new Set();

    Object.values(appointmentData)
      .flat()
      .forEach(item => {
        uniqueVehicles.add(item.vehicleId);
        uniqueInspectors.add(item.inspector);
      });

    setVehicleItems(
      Array.from(uniqueVehicles).map(v => ({label: v, value: v})),
    );
    setInspectorItems(
      Array.from(uniqueInspectors).map(i => ({label: i, value: i})),
    );
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

  const onDayPress = day => {
    const date = day.dateString;
    setSelectedDate(date);
    const data = appointmentData[date] || [];
    setAppointments(data);
    applyFilters(data, vehicleValue, inspectorValue, statusValue);
  };

  const applyFilters = (data, vehicleFilter, inspectorFilter, statusFilter) => {
    let result = data;
    if (vehicleFilter) {
      result = result.filter(app => app.vehicleId === vehicleFilter);
    }
    if (inspectorFilter) {
      result = result.filter(app => app.inspector === inspectorFilter);
    }
    if (statusFilter) {
      result = result.filter(app => app.status === statusFilter);
    }
    setFilteredAppointments(result);
  };

  // Apply filters when any filter value changes
  useEffect(() => {
    applyFilters(appointments, vehicleValue, inspectorValue, statusValue);
  }, [vehicleValue, inspectorValue, statusValue, appointments]);

  const handleAppointmentPress = appointment => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const clearAllFilters = () => {
    setVehicleValue(null);
    setInspectorValue(null);
    setStatusValue(null);
  };

  return (
    <View style={{flex: 1}}>
      <StatusBar backgroundColor="#0284c7" barStyle="light-content" />
      <Header
        title="Maintenance Calendar"
        onMenuPress={() => navigation.openDrawer()}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('MaintenanceSchedule')}>
            <Text style={styles.addButtonText}>+ Add Schedule</Text>
          </TouchableOpacity>

          {/* Filter Section */}
          <View style={styles.filterWrapper}>
            <Text style={styles.filterTitle}>Filters:</Text>
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            <View style={[styles.flexDropdown, {zIndex: 3000}]}>
              <DropDownPicker
                open={vehicleOpen}
                value={vehicleValue}
                items={vehicleItems}
                setOpen={setVehicleOpen}
                setValue={setVehicleValue}
                setItems={setVehicleItems}
                placeholder="Vehicle"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                listMode="SCROLLVIEW"
              />
            </View>

            <View style={[styles.flexDropdown, {zIndex: 2000}]}>
              <DropDownPicker
                open={inspectorOpen}
                value={inspectorValue}
                items={inspectorItems}
                setOpen={setInspectorOpen}
                setValue={setInspectorValue}
                setItems={setInspectorItems}
                placeholder="Inspector"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                listMode="SCROLLVIEW"
              />
            </View>

            <View style={[styles.flexDropdown, {zIndex: 1000}]}>
              <DropDownPicker
                open={statusOpen}
                value={statusValue}
                items={statusItems}
                setOpen={setStatusOpen}
                setValue={setStatusValue}
                setItems={setStatusItems}
                placeholder="Status"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                listMode="SCROLLVIEW"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() =>
              applyFilters(
                appointments,
                vehicleValue,
                inspectorValue,
                statusValue,
              )
            }>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>

          <Calendar
            markedDates={{
              ...markedDates,
              [selectedDate]: {
                ...markedDates[selectedDate],
                selected: true,
                selectedColor: '#0ea5e9',
              },
            }}
            onDayPress={onDayPress}
            theme={{
              selectedDayBackgroundColor: '#0ea5e9',
              todayTextColor: '#0284c7',
              arrowColor: '#0284c7',
            }}
          />

          {filteredAppointments.length > 0 ? (
            <View style={styles.listContainer}>
              <Text style={styles.sectionTitle}>
                Appointments on {selectedDate}
              </Text>
              <View style={styles.listContent}>
                <FlatList
                  data={filteredAppointments}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={[
                        styles.card,
                        {
                          backgroundColor:
                            item.status === 'Completed'
                              ? '#dcfce7'
                              : item.status === 'Pending'
                              ? '#fee2e2'
                              : '#e0f2fe',
                        },
                      ]}
                      onPress={() => handleAppointmentPress(item)}>
                      <Text style={styles.cardTitle}>
                        {item.time} - {item.vehicleId}
                      </Text>
                      <Text style={styles.cardSub}>
                        Inspector: {item.inspector}
                      </Text>
                      <Text style={styles.cardSub}>Status: {item.status}</Text>
                      <Text style={styles.cardSub} numberOfLines={1}>
                        Remarks: {item.remarks}
                      </Text>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                  contentContainerStyle={{paddingBottom: 20}}
                />
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {appointments.length === 0
                  ? 'No appointments on selected date'
                  : 'No appointments match current filters'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Appointment Details Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Appointment Details</Text>
              {selectedAppointment && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>
                      {selectedDate} {selectedAppointment.time}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Vehicle ID:</Text>
                    <Text style={styles.detailValue}>
                      {selectedAppointment.vehicleId}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Inspector:</Text>
                    <Text style={styles.detailValue}>
                      {selectedAppointment.inspector}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        {
                          color:
                            selectedAppointment.status === 'Completed'
                              ? '#16a34a'
                              : selectedAppointment.status === 'Pending'
                              ? '#dc2626'
                              : '#0284c7',
                        },
                      ]}>
                      {selectedAppointment.status}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Remarks:</Text>
                    <Text style={[styles.detailValue, styles.remarksText]}>
                      {selectedAppointment.remarks}
                    </Text>
                  </View>
                </>
              )}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    // navigation.navigate('EditAppointment', {appointment: selectedAppointment});
                  }}
                  style={styles.editButton}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  listContainer: {
    marginTop: 20,
    height: height * 0.35,
    minHeight: 200,
  },
  listContent: {
    flex: 1,
  },
  card: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0c4a6e',
  },
  cardSub: {
    fontSize: 14,
    color: '#334155',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  filterWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  filterTitle: {
    fontWeight: 'bold',
    color: '#334155',
    fontSize: 16,
  },
  clearButtonText: {
    color: '#0284c7',
    fontSize: 14,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  flexDropdown: {
    width: '32%',
    marginBottom: 10,
  },
  dropdown: {
    borderColor: '#94a3b8',
    backgroundColor: '#fff',
    minHeight: 40,
  },
  dropdownContainer: {
    borderColor: '#94a3b8',
  },
  applyButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0284c7',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 20,
    color: '#0284c7',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 100,
    color: '#334155',
    fontSize: 16,
  },
  detailValue: {
    flex: 1,
    color: '#475569',
    fontSize: 16,
  },
  remarksText: {
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 25,
  },
  closeButton: {
    backgroundColor: '#0284c7',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  closeText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#f59e0b',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  editText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default MaintenanceCalendarScreen;
