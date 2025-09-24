import React, {useState, useEffect, useCallback, useRef} from 'react';
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
import Toast from 'react-native-toast-message';

const {height} = Dimensions.get('window');

const MaintenanceCalendarScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY-MM'));

  // Filter dropdown states
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [vehicleValue, setVehicleValue] = useState(null);
  const [statusValue, setStatusValue] = useState(null);
  const [setStatusItems] = useState([]);
  const [vehicleItems, setVehicleItems] = useState([]);
  const [statusItems] = useState([
    {label: 'Scheduled', value: 'scheduled'},
    {label: 'Completed', value: 'completed'},
    {label: 'All', value: 'all'},
  ]);

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
    if (open) setStatusOpen(false);
  };

  const handleStatusDropdownOpen = (open) => {
    setStatusOpen(open);
    if (open) setVehicleOpen(false);
  };

  // Fetch maintenance data from API
  const fetchMaintenanceData = async (fromDate, toDate) => {
    if (loading) return;
    
    try {
      setLoading(true);
      const url = `${BASE_URL}maintenance/calendar_view/?from_date=${fromDate}&to_date=${toDate}`;
      const response = await GETNETWORK(url, true);

      if (!response) {
        throw new Error('No response from server');
      }

      const marked = {};
      const allAppointments = [];
      const vehicleMap = new Map();

      // Process scheduled maintenance
      response.maintenance_scheduled?.forEach(item => {
        const date = moment(item.scheduled_date).format('YYYY-MM-DD');
        marked[date] = {
          marked: true,
          dotColor: '#0284c7',
          selectedColor: '#bae6fd',
        };

        if (item.thing_id && item.thing_name) {
          vehicleMap.set(item.thing_id, item.thing_name);
        }

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

        if (item.thing_id && item.thing_name) {
          vehicleMap.set(item.thing_id, item.thing_name);
        }

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
      const uniqueVehicles = Array.from(vehicleMap.entries()).map(([value, label]) => ({
        label: label || value,
        value: value,
      }));

      setVehicleItems(uniqueVehicles);
      filterAppointments(selectedDate, vehicleValue, statusValue);
      
      showToast('success', 'Data Loaded', `Loaded ${allAppointments.length} maintenance records`);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      showToast('error', 'Load Failed', 'Failed to fetch maintenance data');
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments based on selected date and filters
  const filterAppointments = useCallback((date, vehicleFilter, statusFilter) => {
    let result = appointments.filter(app => app.date === date);

    if (vehicleFilter) {
      result = result.filter(app => app.vehicleId === vehicleFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      result = result.filter(app => app.status === statusFilter);
    }

    setFilteredAppointments(result);
  }, [appointments]);

  // Load data when component mounts
  useEffect(() => {
    const fromDate = moment().startOf('month').format('YYYY-MM-DD');
    const toDate = moment().endOf('month').format('YYYY-MM-DD');
    fetchMaintenanceData(fromDate, toDate);
  }, []);

  // Apply filters when any filter value changes
  useEffect(() => {
    filterAppointments(selectedDate, vehicleValue, statusValue);
  }, [vehicleValue, statusValue, appointments, selectedDate, filterAppointments]);

  // Handle day selection in calendar
  const onDayPress = day => {
    setSelectedDate(day.dateString);
    filterAppointments(day.dateString, vehicleValue, statusValue);
    showToast('info', 'Date Selected', moment(day.dateString).format('DD MMM YYYY'));
  };

  const handleMonthChange = month => {
    const newMonth = moment(month.dateString).format('YYYY-MM');
    setCurrentMonth(newMonth);

    const fromDate = moment(month.dateString).startOf('month').format('YYYY-MM-DD');
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
    showToast('info', 'Filters Cleared', 'All filters have been reset');
  };

  const resetForm = () => {
    setSelectedDate(moment().format('YYYY-MM-DD'));
    setVehicleValue(null);
    setStatusValue(null);
    setVehicleOpen(false);
    setStatusOpen(false);
    
    const fromDate = moment().startOf('month').format('YYYY-MM-DD');
    const toDate = moment().endOf('month').format('YYYY-MM-DD');
    fetchMaintenanceData(fromDate, toDate);
    
    showToast('info', 'Form Reset', 'Calendar view has been reset');
  };

  useFocusEffect(
    useCallback(() => {
      resetForm();
      return () => {
        setVehicleOpen(false);
        setStatusOpen(false);
      };
    }, []),
  );

  // Get card background color based on status
  const getCardColor = status => {
    switch (status) {
      case 'completed':
        return '#dcfce7';
      case 'scheduled':
        return '#e0f2fe';
      default:
        return '#e0f2fe';
    }
  };

  // Get card border color based on status
  const getBorderColor = status => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'scheduled':
        return '#0284c7';
      default:
        return '#0284c7';
    }
  };

  const renderAppointmentItem = ({item}) => (
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
            color: item.status === 'completed' ? '#10b981' : '#0284c7',
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
  );

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
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            
            {/* Add Schedule Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('MaintenanceSchedule')}>
              <Text style={styles.addButtonText}>+ Add Schedule</Text>
            </TouchableOpacity>

            {/* Filter Section */}
            <View style={styles.filterWrapper}>
              <Text style={styles.filterTitle}>Filters</Text>
              <TouchableOpacity onPress={clearAllFilters}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Dropdowns */}
            <View style={styles.filterRow}>
              <View style={[styles.flexDropdown, {zIndex: vehicleOpen ? zIndexCounter.current + 1 : 1}]}>
                <DropDownPicker
                  searchable={true}
                  searchablePlaceholder="Search Vehicle"
                  open={vehicleOpen}
                  value={vehicleValue}
                  items={vehicleItems}
                  setOpen={handleVehicleDropdownOpen}
                  setValue={setVehicleValue}
                  setItems={setVehicleItems}
                  placeholder="Select Vehicle"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  textStyle={styles.dropdownText}
                  placeholderStyle={styles.dropdownPlaceholder}
                  listMode="SCROLLVIEW"
                  scrollViewProps={{nestedScrollEnabled: true}}
                />
              </View>

              <View style={[styles.flexDropdown, {zIndex: statusOpen ? zIndexCounter.current + 1 : 1}]}>
                <DropDownPicker
                  searchable={true}
                  searchablePlaceholder="Search Status"
                  open={statusOpen}
                  value={statusValue}
                  items={statusItems}
                  setOpen={handleStatusDropdownOpen}
                  setValue={setStatusValue}
                  setItems={setStatusItems}
                  placeholder="Select Status"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  textStyle={styles.dropdownText}
                  placeholderStyle={styles.dropdownPlaceholder}
                  listMode="SCROLLVIEW"
                  scrollViewProps={{nestedScrollEnabled: true}}
                />
              </View>
            </View>

            {/* Calendar */}
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
              hideExtraDays={true}
              firstDay={1}
              current={currentMonth}
              theme={{
                selectedDayBackgroundColor: '#0ea5e9',
                todayTextColor: '#0284c7',
                arrowColor: '#0284c7',
              }}
            />

            {/* Appointments List */}
            {filteredAppointments.length > 0 ? (
              <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>
                  Appointments on {moment(selectedDate).format('DD MMM YYYY')}
                </Text>
                <View style={styles.listContent}>
                  <FlatList
                    data={filteredAppointments}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderAppointmentItem}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={styles.flatListContent}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {appointments.filter(a => a.date === selectedDate).length === 0
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
                        {selectedAppointment.vehicleName || selectedAppointment.vehicleId}
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
                          styles.statusText,
                          {
                            color: selectedAppointment.status === 'completed' ? '#10b981' : '#0284c7',
                          },
                        ]}>
                        {selectedAppointment.status.toUpperCase()}
                      </Text>
                    </View>
                    {selectedAppointment.remarks && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          {selectedAppointment.status === 'completed' ? 'Work Performed:' : 'Remarks:'}
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
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
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
  flatListContent: {
    paddingBottom: 20,
  },
  card: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#0c4a6e',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 4,
  },
  cardStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  addButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
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
    marginBottom: 12,
  },
  filterTitle: {
    fontWeight: '600',
    color: '#374151',
    fontSize: 16,
  },
  clearButtonText: {
    color: '#0284c7',
    fontSize: 14,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  flexDropdown: {
    flex: 1,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderWidth: 1.5,
    borderRadius: 8,
    minHeight: 48,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderWidth: 1.5,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 14,
    color: '#111827',
  },
  dropdownPlaceholder: {
    color: '#9ca3af',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
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
    maxWidth: 400,
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontWeight: '600',
    fontSize: 20,
    marginBottom: 20,
    color: '#0284c7',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontWeight: '600',
    width: 120,
    color: '#374151',
    fontSize: 14,
  },
  detailValue: {
    flex: 1,
    color: '#475569',
    fontSize: 14,
  },
  statusText: {
    fontWeight: '600',
  },
  remarksText: {
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 25,
    gap: 12,
  },
  closeButton: {
    backgroundColor: '#0284c7',
    padding: 12,
    borderRadius: 8,
    flex: 1,
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
  },
  editText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default MaintenanceCalendarScreen;