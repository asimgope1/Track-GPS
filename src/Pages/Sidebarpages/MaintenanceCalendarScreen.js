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
  ActivityIndicator,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import Header from '../../components/Header';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import {BASE_URL} from '../../constants/url';
import {GETNETWORK} from '../../utils/Network';
import moment from 'moment';
import { Loader } from '../../components/Loader';

const {height} = Dimensions.get('window');

const MaintenanceCalendarScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    moment().format('YYYY-MM-DD'),
  );
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY-MM'));

  // Filter dropdown states
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [vehicleValue, setVehicleValue] = useState(null);
  const [statusValue, setStatusValue] = useState(null);
  const [vehicleItems, setVehicleItems] = useState([]);
  const [statusItems,
  setStatusItems] = useState([
    {label: 'Scheduled', value: 'scheduled'},
    {label: 'Completed', value: 'completed'},
    {label: 'All', value: 'all'},
  ]);


  const resetForm = () => {
    setSelectedDate(moment().format('YYYY-MM-DD')); // Reset to today's date
    setVehicleValue(null); // Clear vehicle filter
    setStatusValue(null); // Clear status filter
    setVehicleOpen(false); // Close vehicle dropdown if open
    setStatusOpen(false); // Close status dropdown if open
    // Re-fetch data for the current month
    const fromDate = moment().startOf('month').format('YYYY-MM-DD');
    const toDate = moment().endOf('month').format('YYYY-MM-DD');
    fetchMaintenanceData(fromDate, toDate);
  };
  // Fetch maintenance data from API
  const fetchMaintenanceData = async (fromDate, toDate) => {
    try {
      setLoading(true);
      const url = `${BASE_URL}maintenance/calendar_view/?from_date=${fromDate}&to_date=${toDate}`;
      const response = await GETNETWORK(url, true);

      // Process the response data
      const marked = {};
      const allAppointments = [];

      // Process scheduled maintenance
      response.maintenance_scheduled?.forEach(item => {
        const date = moment(item.scheduled_date).format('YYYY-MM-DD');
        marked[date] = {
          marked: true,
          dotColor: '#0284c7',
          selectedColor: '#bae6fd',
        };

        allAppointments.push({
          id: item.id,
          date: date,
          time: moment(item.created_on).format('hh:mm A'),
          vehicleId: item.thing_id,
          vehicleName: item.thing_name,
          maintenanceName: item.maintenance_name,
          remarks: item.remarks,
          status: 'scheduled',
          type: item.scheduled_type,
          createdBy: item.created_by,
        });
      });

      // Process completed maintenance
      response.maintenance_completed?.forEach(item => {
        const date = moment(item.reported_on).format('YYYY-MM-DD');
        marked[date] = {
          marked: true,
          dotColor: '#10b981',
          selectedColor: '#bae6fd',
        };

        allAppointments.push({
          id: item.id,
          date: date,
          time: moment(item.reported_on).format('hh:mm A'),
          vehicleId: item.thing_id,
          vehicleName: item.thing_name,
          maintenanceName: item.maintenance_name,
          remarks: item.work_performed,
          status: 'completed',
          jobStatus: item.job_status,
          partsReplaced: item.parts_replaced,
          estimatedCost: item.estimated_cost,
        });
      });

      setMarkedDates(marked);
      setAppointments(allAppointments);

      // Update vehicle dropdown items
      const uniqueVehicles = [
        ...new Set(allAppointments.map(item => item.vehicleId)),
      ];
      setVehicleItems(
        uniqueVehicles.map(v => ({
          label: v,
          value: v,
        })),
      );

      // Filter appointments for the selected date
      filterAppointments(selectedDate, vehicleValue, statusValue);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      Alert.alert('Error', 'Failed to fetch maintenance data');
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments based on selected date and filters
  const filterAppointments = (date, vehicleFilter, statusFilter) => {
    let result = appointments.filter(app => app.date === date);

    if (vehicleFilter) {
      result = result.filter(app => app.vehicleId === vehicleFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      result = result.filter(app => app.status === statusFilter);
    }

    setFilteredAppointments(result);
  };

  // Load data when component mounts
useEffect(() => {
  const fromDate = moment().startOf('month').format('YYYY-MM-DD');
  const toDate = moment().endOf('month').format('YYYY-MM-DD');
  fetchMaintenanceData(fromDate, toDate);
}, []);
useFocusEffect(
  useCallback(() => {
    resetForm();
    return () => {
      // Cleanup if needed
    };
  }, []),
);
  // Apply filters when any filter value changes
  useEffect(() => {
    filterAppointments(selectedDate, vehicleValue, statusValue);
  }, [vehicleValue, statusValue, appointments, selectedDate]);

  // Handle day selection in calendar
  const onDayPress = day => {
    console.log('day.dateString', day.dateString);
    setSelectedDate(day.dateString);
    filterAppointments(day.dateString, vehicleValue, statusValue);
  };



  const handleMonthChange = month => {
    const newMonth = moment(month.dateString).format('YYYY-MM');
    setCurrentMonth(newMonth);

    const fromDate = moment(month.dateString)
      .startOf('month')
      .format('YYYY-MM-DD');
    const toDate = moment(month.dateString).endOf('month').format('YYYY-MM-DD');

    fetchMaintenanceData(fromDate, toDate);
  };

  // Handle appointment press to show details
  const handleAppointmentPress = appointment => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setVehicleValue(null);
    setStatusValue(null);
    filterAppointments(selectedDate, null, null);
  };

  // Get card background color based on status
  const getCardColor = status => {
    switch (status) {
      case 'completed':
        return '#dcfce7'; // green-100
      case 'scheduled':
        return '#e0f2fe'; // blue-100
      default:
        return '#e0f2fe'; // default blue
    }
  };

  // Get card border color based on status
  const getBorderColor = status => {
    switch (status) {
      case 'completed':
        return '#10b981'; // green-500
      case 'scheduled':
        return '#0284c7'; // blue-600
      default:
        return '#0284c7'; // default blue
    }
  };

  return (
    <View style={{flex: 1}}>
      <StatusBar backgroundColor="#0284c7" barStyle="light-content" />
      <Header
        title="Maintenance Calendar"
        onMenuPress={() => navigation.openDrawer()}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : (
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
              <View style={[styles.flexDropdown, {zIndex: 2000}]}>
                <DropDownPicker
                searchable={true}
                  searchablePlaceholder="Search Vehicle"
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

              <View style={[styles.flexDropdown, {zIndex: 1000}]}>
                <DropDownPicker
                  searchable={true}
                  searchablePlaceholder="Search Status"
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
              onMonthChange={handleMonthChange}
              onVisibleMonthsChange={months => {
                const month = months[0];
                const newMonth = moment(month.dateString).format('YYYY-MM');
                if (newMonth !== currentMonth) {
                  setCurrentMonth(newMonth);
                  const fromDate = moment(month.dateString)
                    .startOf('month')
                    .format('YYYY-MM-DD');
                  const toDate = moment(month.dateString)
                    .endOf('month')
                    .format('YYYY-MM-DD');
                  fetchMaintenanceData(fromDate, toDate);
                }
              }}
              // for old month also
              hideExtraDays={true}
              firstDay={1}

              current={currentMonth}
              theme={{
                selectedDayBackgroundColor: '#0ea5e9',
                todayTextColor: '#0284c7',
                arrowColor: '#0284c7',
              }}
            />

            {filteredAppointments.length > 0 ? (
              <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>
                  Appointments on {moment(selectedDate).format('DD MMM YYYY')}
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
                            backgroundColor: getCardColor(item.status),
                            borderLeftColor: getBorderColor(item.status),
                          },
                        ]}
                        onPress={() => handleAppointmentPress(item)}>
                        <Text style={styles.cardTitle}>
                          {item.time} - {item.vehicleName || item.vehicleId}
                        </Text>
                        <Text style={styles.cardSub}>
                          Maintenance: {item.maintenanceName}
                        </Text>
                        <Text
                          style={[
                            styles.cardStatus,
                            {
                              color:
                                item.status === 'completed'
                                  ? '#10b981'
                                  : '#0284c7',
                            },
                          ]}>
                          Status: {item.status.toUpperCase()}
                        </Text>
                        {item.remarks && (
                          <Text style={styles.cardSub} numberOfLines={1}>
                            Remarks: {item.remarks}
                          </Text>
                        )}
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
                  {appointments.filter(a => a.date === selectedDate).length ===
                  0
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
                        {moment(selectedAppointment.date).format('DD MMM YYYY')}{' '}
                        {selectedAppointment.time}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Vehicle:</Text>
                      <Text style={styles.detailValue}>
                        {selectedAppointment.vehicleName ||
                          selectedAppointment.vehicleId}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Maintenance:</Text>
                      <Text style={styles.detailValue}>
                        {selectedAppointment.maintenanceName}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <Text
                        style={[
                          styles.detailValue,
                          {
                            color:
                              selectedAppointment.status === 'completed'
                                ? '#10b981'
                                : '#0284c7',
                            fontWeight: 'bold',
                          },
                        ]}>
                        {selectedAppointment.status.toUpperCase()}
                      </Text>
                    </View>
                    {selectedAppointment.remarks && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          {selectedAppointment.status === 'completed'
                            ? 'Work Performed:'
                            : 'Remarks:'}
                        </Text>
                        <Text style={[styles.detailValue, styles.remarksText]}>
                          {selectedAppointment.remarks}
                        </Text>
                      </View>
                    )}
                    {selectedAppointment.partsReplaced && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Parts Replaced:</Text>
                        <Text style={styles.detailValue}>
                          {selectedAppointment.partsReplaced}
                        </Text>
                      </View>
                    )}
                    {selectedAppointment.estimatedCost && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Estimated Cost:</Text>
                        <Text style={styles.detailValue}>
                          ₹{selectedAppointment.estimatedCost}
                        </Text>
                      </View>
                    )}
                  </>
                )}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}>
                    <Text style={styles.closeText}>Close</Text>
                  </TouchableOpacity>
                  {selectedAppointment?.status === 'scheduled' && (
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible(false);
                        navigation.navigate('EditMaintenance', {
                          appointment: selectedAppointment,
                        });
                      }}
                      style={styles.editButton}>
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </Modal>
           <Loader visible={loading} />
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  cardStatus: {
    fontSize: 14,
    fontWeight: 'bold',
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
    width: '48%',
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
    width: 120,
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
