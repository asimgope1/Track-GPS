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
  const [vehicleItems, setVehicleItems] = useState([]);
  const [statusItems, setStatusItems] = useState([
    {label: 'Scheduled', value: 'scheduled'},
    {label: 'Scheduled Overdue', value: 'scheduled_overdue'},
    {label: 'Completed', value: 'completed'},
    {label: 'All', value: 'all'},
  ]);

  const zIndexCounter = useRef(1000);
  const isMounted = useRef(true);

  // Function to determine appointment status (including overdue logic)
  const getAppointmentStatus = (appointment) => {
    if (appointment.status === 'completed') {
      return 'completed';
    }
    
    // For scheduled appointments, check if they are overdue
    if (appointment.status === 'scheduled') {
      const appointmentDate = moment(appointment.date);
      const today = moment().startOf('day');
      
      // If appointment date is before today, it's overdue
      if (appointmentDate.isBefore(today)) {
        return 'scheduled_overdue';
      }
    }
    
    return appointment.status;
  };

  // Function to check if a date has overdue appointments
  const hasOverdueAppointments = (date, appointmentsData) => {
    return appointmentsData.some(app => {
      const appointmentStatus = getAppointmentStatus(app);
      return app.date === date && appointmentStatus === 'scheduled_overdue';
    });
  };

  // Validation functions
  const validateDate = (date) => {
    if (!date) return false;
    return moment(date, 'YYYY-MM-DD', true).isValid();
  };

  const validateMonth = (month) => {
    if (!month) return false;
    return moment(month, 'YYYY-MM', true).isValid();
  };

  const validateApiResponse = (response) => {
    if (!response) {
      throw new Error('Invalid API response: Response is null or undefined');
    }

    if (typeof response !== 'object') {
      throw new Error('Invalid API response: Expected object');
    }

    // Validate maintenance_scheduled array
    if (response.maintenance_scheduled && !Array.isArray(response.maintenance_scheduled)) {
      throw new Error('Invalid API response: maintenance_scheduled should be an array');
    }

    // Validate maintenance_completed array
    if (response.maintenance_completed && !Array.isArray(response.maintenance_completed)) {
      throw new Error('Invalid API response: maintenance_completed should be an array');
    }

    return true;
  };

  const validateAppointmentData = (appointment) => {
    const requiredFields = ['id', 'date', 'status'];
    const missingFields = requiredFields.filter(field => !appointment[field]);
    
    if (missingFields.length > 0) {
      console.warn('Invalid appointment data - missing fields:', missingFields, appointment);
      return false;
    }

    if (!validateDate(appointment.date)) {
      console.warn('Invalid appointment date:', appointment.date);
      return false;
    }

    return true;
  };

  // Toast configuration
  const showToast = (type, title, message) => {
    if (!isMounted.current) return;
    
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

  // Cleanup function
  const cleanup = useCallback(() => {
    if (isMounted.current) {
      setLoading(false);
      setVehicleOpen(false);
      setStatusOpen(false);
      setModalVisible(false);
    }
  }, []);

  // Clear all state function
  const clearAllState = useCallback(() => {
    if (!isMounted.current) return;

    setMarkedDates({});
    setAppointments([]);
    setSelectedDate(moment().format('YYYY-MM-DD'));
    setFilteredAppointments([]);
    setSelectedAppointment(null);
    setModalVisible(false);
    setCurrentMonth(moment().format('YYYY-MM'));
    setVehicleValue(null);
    setStatusValue(null);
    setVehicleOpen(false);
    setStatusOpen(false);
    setVehicleItems([]);
  }, []);

  // Optimized dropdown handlers
  const handleVehicleDropdownOpen = (open) => {
    if (!isMounted.current) return;
    setVehicleOpen(open);
    if (open) setStatusOpen(false);
  };

  const handleStatusDropdownOpen = (open) => {
    if (!isMounted.current) return;
    setStatusOpen(open);
    if (open) setVehicleOpen(false);
  };

  // Filter appointments function with validation
  const filterAppointments = useCallback((date, vehicleFilter, statusFilter, appointmentsData) => {
    if (!isMounted.current) return;

    // Validate date
    if (!validateDate(date)) {
      console.warn('Invalid date provided for filtering:', date);
      setFilteredAppointments([]);
      return;
    }

    const dataToFilter = appointmentsData || appointments;
    
    if (!Array.isArray(dataToFilter)) {
      console.warn('Invalid appointments data for filtering');
      setFilteredAppointments([]);
      return;
    }

    let result = dataToFilter.filter(app => {
      // Validate each appointment before filtering
      if (!validateAppointmentData(app)) return false;
      
      const appointmentStatus = getAppointmentStatus(app);
      return app.date === date;
    });

    if (vehicleFilter) {
      result = result.filter(app => app.vehicleId === vehicleFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      result = result.filter(app => {
        const appointmentStatus = getAppointmentStatus(app);
        return appointmentStatus === statusFilter;
      });
    }

    setFilteredAppointments(result);
  }, [appointments]);

  // Fetch maintenance data from API with enhanced validation
  const fetchMaintenanceData = async (fromDate, toDate) => {
    if (loading || !isMounted.current) return;
    
    // Validate dates
    if (!validateDate(fromDate) || !validateDate(toDate)) {
      showToast('error', 'Invalid Date', 'Please provide valid dates');
      return;
    }

    try {
      setLoading(true);
      const url = `${BASE_URL}maintenance/calendar_view/?from_date=${fromDate}&to_date=${toDate}`;
      const response = await GETNETWORK(url, true);

      // Validate API response
      validateApiResponse(response);

      const marked = {};
      const allAppointments = [];
      const vehicleMap = new Map();

      // Process scheduled maintenance with validation
      if (Array.isArray(response.maintenance_scheduled)) {
        response.maintenance_scheduled.forEach(item => {
          try {
            if (!item || typeof item !== 'object') {
              console.warn('Invalid scheduled maintenance item:', item);
              return;
            }

            const date = moment(item.scheduled_date).isValid() 
              ? moment(item.scheduled_date).format('YYYY-MM-DD')
              : null;

            if (!date) {
              console.warn('Invalid scheduled date for item:', item);
              return;
            }

            // Determine dot color based on overdue status
            const appointmentDate = moment(date);
            const today = moment().startOf('day');
            const isOverdue = appointmentDate.isBefore(today);
            
            marked[date] = {
              marked: true,
              dotColor: isOverdue ? '#ef4444' : '#0284c7', // Red for overdue, blue for scheduled
              selectedColor: '#bae6fd',
            };

            if (item.thing_id) {
              vehicleMap.set(item.thing_id, item.thing_name || `Vehicle ${item.thing_id}`);
            }

            const appointment = {
              id: item.id || `scheduled-${Date.now()}-${Math.random()}`,
              date: date,
              time: moment(item.created_on).isValid() 
                ? moment(item.created_on).format('hh:mm A')
                : 'Unknown Time',
              vehicleId: item.thing_id,
              vehicleName: item.thing_name || `Vehicle ${item.thing_id}`,
              maintenanceName: item.maintenance_name || 'Unknown Maintenance',
              remarks: item.remarks || '',
              status: 'scheduled', // Base status, will be determined by getAppointmentStatus
              type: item.scheduled_type,
              createdBy: item.created_by,
              isOverdue: isOverdue, // Store overdue flag for easy access
            };

            if (validateAppointmentData(appointment)) {
              allAppointments.push(appointment);
            }
          } catch (error) {
            console.warn('Error processing scheduled maintenance item:', error, item);
          }
        });
      }

      // Process completed maintenance with validation
      if (Array.isArray(response.maintenance_completed)) {
        response.maintenance_completed.forEach(item => {
          try {
            if (!item || typeof item !== 'object') {
              console.warn('Invalid completed maintenance item:', item);
              return;
            }

            const date = moment(item.reported_on).isValid()
              ? moment(item.reported_on).format('YYYY-MM-DD')
              : null;

            if (!date) {
              console.warn('Invalid reported date for item:', item);
              return;
            }

            marked[date] = {
              marked: true,
              dotColor: '#10b981',
              selectedColor: '#bae6fd',
            };

            if (item.thing_id) {
              vehicleMap.set(item.thing_id, item.thing_name || `Vehicle ${item.thing_id}`);
            }

            const appointment = {
              id: item.id || `completed-${Date.now()}-${Math.random()}`,
              date: date,
              time: moment(item.reported_on).isValid()
                ? moment(item.reported_on).format('hh:mm A')
                : 'Unknown Time',
              vehicleId: item.thing_id,
              vehicleName: item.thing_name || `Vehicle ${item.thing_id}`,
              maintenanceName: item.maintenance_name || 'Unknown Maintenance',
              remarks: item.work_performed || '',
              status: 'completed',
              jobStatus: item.job_status,
              partsReplaced: item.parts_replaced,
              estimatedCost: item.estimated_cost,
              isOverdue: false, // Completed appointments are never overdue
            };

            if (validateAppointmentData(appointment)) {
              allAppointments.push(appointment);
            }
          } catch (error) {
            console.warn('Error processing completed maintenance item:', error, item);
          }
        });
      }

      if (isMounted.current) {
        setMarkedDates(marked);
        setAppointments(allAppointments);

        // Update vehicle dropdown items
        const uniqueVehicles = Array.from(vehicleMap.entries()).map(([value, label]) => ({
          label: label,
          value: value,
        }));

        setVehicleItems(uniqueVehicles);
        
        // Filter appointments with the new data
        filterAppointments(selectedDate, vehicleValue, statusValue, allAppointments);
        
        showToast('success', 'Data Loaded', `Loaded ${allAppointments.length} maintenance records`);
      }
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      if (isMounted.current) {
        showToast('error', 'Load Failed', error.message || 'Failed to fetch maintenance data');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Load data when component mounts
  useEffect(() => {
    isMounted.current = true;
    
    const fromDate = moment().startOf('month').format('YYYY-MM-DD');
    const toDate = moment().endOf('month').format('YYYY-MM-DD');
    
    if (validateDate(fromDate) && validateDate(toDate)) {
      fetchMaintenanceData(fromDate, toDate);
    }

    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, []);

  // Apply filters when any filter value or selected date changes
  useEffect(() => {
    if (appointments.length > 0 && validateDate(selectedDate)) {
      filterAppointments(selectedDate, vehicleValue, statusValue);
    }
  }, [vehicleValue, statusValue, selectedDate, appointments.length, filterAppointments]);

  // Handle day selection in calendar with validation
  const onDayPress = day => {
    if (!day || !day.dateString || !validateDate(day.dateString)) {
      showToast('error', 'Invalid Date', 'Please select a valid date');
      return;
    }

    setSelectedDate(day.dateString);
    showToast('info', 'Date Selected', moment(day.dateString).format('DD MMM YYYY'));
  };

  const handleMonthChange = month => {
    if (!month || !month.dateString || !validateDate(month.dateString)) {
      showToast('error', 'Invalid Month', 'Please select a valid month');
      return;
    }

    const newMonth = moment(month.dateString).format('YYYY-MM');
    if (!validateMonth(newMonth)) {
      showToast('error', 'Invalid Month', 'Invalid month format');
      return;
    }

    setCurrentMonth(newMonth);

    const fromDate = moment(month.dateString).startOf('month').format('YYYY-MM-DD');
    const toDate = moment(month.dateString).endOf('month').format('YYYY-MM-DD');

    if (validateDate(fromDate) && validateDate(toDate)) {
      fetchMaintenanceData(fromDate, toDate);
    }
  };

  // Handle appointment press to show details with validation
  const handleAppointmentPress = appointment => {
    if (!appointment || !validateAppointmentData(appointment)) {
      showToast('error', 'Invalid Appointment', 'Cannot view invalid appointment details');
      return;
    }

    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  // Clear all filters
  const clearAllFilters = () => {
    if (!isMounted.current) return;
    
    setVehicleValue(null);
    setStatusValue(null);
    showToast('info', 'Filters Cleared', 'All filters have been reset');
  };

  const resetForm = () => {
    if (!isMounted.current) return;

    const today = moment().format('YYYY-MM-DD');
    setSelectedDate(today);
    setVehicleValue(null);
    setStatusValue(null);
    setVehicleOpen(false);
    setStatusOpen(false);
    
    const fromDate = moment().startOf('month').format('YYYY-MM-DD');
    const toDate = moment().endOf('month').format('YYYY-MM-DD');
    
    if (validateDate(fromDate) && validateDate(toDate)) {
      fetchMaintenanceData(fromDate, toDate);
    }
    
    showToast('info', 'Form Reset', 'Calendar view has been reset');
  };

  // Navigation effect - clear state when navigating away
  useFocusEffect(
    useCallback(() => {
      isMounted.current = true;
      resetForm();

      return () => {
        // Clear state when screen loses focus
        cleanup();
      };
    }, []),
  );

  // Handle navigation state changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      cleanup();
    });

    const unsubscribeFocus = navigation.addListener('focus', () => {
      isMounted.current = true;
    });

    return () => {
      unsubscribe();
      unsubscribeFocus();
    };
  }, [navigation, cleanup]);

  // Get card background color based on status
  const getCardColor = status => {
    switch (status) {
      case 'completed':
        return '#dcfce7';
      case 'scheduled':
        return '#e0f2fe';
      case 'scheduled_overdue':
        return '#fee2e2';
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
      case 'scheduled_overdue':
        return '#ef4444';
      default:
        return '#0284c7';
    }
  };

  // Get status text color based on status
  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'scheduled':
        return '#0284c7';
      case 'scheduled_overdue':
        return '#ef4444';
      default:
        return '#0284c7';
    }
  };

  // Get status display text
  const getStatusText = status => {
    switch (status) {
      case 'completed':
        return 'COMPLETED';
      case 'scheduled':
        return 'SCHEDULED';
      case 'scheduled_overdue':
        return 'SCHEDULED OVERDUE';
      default:
        return status.toUpperCase();
    }
  };

  const renderAppointmentItem = ({item}) => {
    if (!validateAppointmentData(item)) {
      return null; // Don't render invalid appointments
    }

    const appointmentStatus = getAppointmentStatus(item);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: getCardColor(appointmentStatus),
            borderLeftColor: getBorderColor(appointmentStatus),
          },
        ]}
        onPress={() => handleAppointmentPress(item)}>
        <Text style={styles.cardTitle}>
          {item.time} - {item.vehicleName}
        </Text>
        <Text style={styles.cardSub}>
          Maintenance: {item.maintenanceName}
        </Text>
        <Text
          style={[
            styles.cardStatus,
            {
              color: getStatusColor(appointmentStatus),
            },
          ]}>
          Status: {getStatusText(appointmentStatus)}
        </Text>
        {item.remarks && (
          <Text style={styles.cardSub} numberOfLines={1}>
            Remarks: {item.remarks}
          </Text>
        )}
        {appointmentStatus === 'scheduled_overdue' && (
          <Text style={[styles.cardSub, {color: '#ef4444', fontStyle: 'italic'}]}>
            ⚠️ This maintenance was due on {moment(item.date).format('DD MMM YYYY')}
          </Text>
        )}
      </TouchableOpacity>
    );
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

            {/* Legend for calendar dots */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#0284c7'}]} />
                <Text style={styles.legendText}>Scheduled</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#ef4444'}]} />
                <Text style={styles.legendText}>Overdue</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#10b981'}]} />
                <Text style={styles.legendText}>Completed</Text>
              </View>
            </View>

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
                {selectedAppointment && validateAppointmentData(selectedAppointment) ? (
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
                        {selectedAppointment.vehicleName}
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
                            color: getStatusColor(getAppointmentStatus(selectedAppointment)),
                            fontWeight: 'bold',
                          },
                        ]}>
                        {getStatusText(getAppointmentStatus(selectedAppointment))}
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
                    {getAppointmentStatus(selectedAppointment) === 'scheduled_overdue' && (
                      <View style={styles.overdueWarning}>
                        <Text style={styles.overdueWarningText}>
                          ⚠️ This maintenance is overdue. It was scheduled for {moment(selectedAppointment.date).format('DD MMM YYYY')}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={styles.errorText}>Invalid appointment data</Text>
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
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 20,
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
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
  },
  overdueWarning: {
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  overdueWarningText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MaintenanceCalendarScreen;