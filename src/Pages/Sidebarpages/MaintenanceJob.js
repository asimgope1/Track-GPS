import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Calendar } from 'react-native-calendars';
import Header from '../../components/Header';
import { BASE_URL } from '../../constants/url';
import { GETNETWORK, POSTNETWORK } from '../../utils/Network';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { Loader } from '../../components/Loader';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const MaintenanceJobScreen = ({ navigation }) => {
  // State variables
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vehicleValue, setVehicleValue] = useState(null);
  const [vehicleItems, setVehicleItems] = useState([]);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [maintenanceValue, setMaintenanceValue] = useState(null);
  const [maintenanceItems, setMaintenanceItems] = useState([]);
  const [issues, setIssues] = useState('');
  const [work, setWork] = useState('');
  const [parts, setParts] = useState('');
  const [cost, setCost] = useState('');
  const [km, setKm] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobStart, setJobStart] = useState('');
  const [jobEnd, setJobEnd] = useState('');
  const [calendarVisible, setCalendarVisible] = useState({
    start: false,
    end: false,
  });
  const [jobList, setJobList] = useState([]);
  const zIndexCounter = useRef(1000);

  // Toast configuration
  const showToast = useCallback((type, title, message) => {
    Toast.show({
      type,
      position: 'top',
      text1: title,
      text2: message,
      visibilityTime: type === 'error' ? 4000 : 3000,
      autoHide: true,
      topOffset: StatusBar.currentHeight || 40,
    });
  }, []);

  // Optimized dropdown handlers
  const handleVehicleDropdownOpen = useCallback((open) => {
    setVehicleOpen(open);
    if (open) setMaintenanceOpen(false);
  }, []);

  const handleMaintenanceDropdownOpen = useCallback((open) => {
    setMaintenanceOpen(open);
    if (open) setVehicleOpen(false);
  }, []);

  const handleDateSelect = useCallback((date, type) => {
    if (type === 'start') {
      setJobStart(date.dateString);
      showToast('success', 'Start Date Selected', moment(date.dateString).format('DD MMM YYYY'));
    } else {
      setJobEnd(date.dateString);
      showToast('success', 'End Date Selected', moment(date.dateString).format('DD MMM YYYY'));
    }
    setCalendarVisible(prev => ({ ...prev, [type]: false }));
  }, [showToast]);

  // API Functions
  const GetVehicle = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const url = `${BASE_URL}projects/117/things/?page=1&search=`;
    try {
      const response = await GETNETWORK(url, true);
      const vehicles = response.data?.things || [];
      if (vehicles.length === 0) {
        throw new Error('No vehicles found');
      }
      const mappedItems = vehicles.map(item => ({
        label: item.thing_name,
        value: item.thing_id,
      }));
      setVehicleItems(mappedItems);
      showToast('success', 'Vehicles Loaded', `${vehicles.length} vehicles loaded`);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      showToast('error', 'Load Failed', error.message || 'Failed to fetch vehicle data');
    } finally {
      setLoading(false);
    }
  }, [loading, showToast]);

  const GetMaintenance = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const url = `${BASE_URL}maintenance/maintenance_master/`;
    try {
      const response = await GETNETWORK(url, true);
      const mappedItems = response.data.map(item => ({
        label: item.maintenance_name,
        value: item.maintenance_id,
      }));
      if (mappedItems.length === 0) {
        throw new Error('No maintenance types found');
      }
      setMaintenanceItems(mappedItems);
      showToast('success', 'Maintenance Types Loaded', `${mappedItems.length} maintenance types loaded`);
    } catch (error) {
      console.error('Error fetching maintenance:', error);
      showToast('error', 'Load Failed', error.message || 'Failed to fetch maintenance data');
    } finally {
      setLoading(false);
    }
  }, [loading, showToast]);

  const GetJobList = useCallback(async () => {
    console.log('hiiiiii')
    if (loading) return;
    setLoading(true);
    const url = `${BASE_URL}maintenance/maintenance_job_card/`;
    try {
      const response = await GETNETWORK(url, true);
      console.log('responseofjob', response);
      if (!response || !response.data) {
        throw new Error('No data returned from server');
      }
      const jobs = response.data.map(job => ({
        id: job.id,
        vehicle: job.thing_name,
        type: job.maintenance_id,
        issues: job.reported_issue,
        work: job.work_performed,
        parts: job.parts_replaced,
        cost: job.estimated_cost,
        km: job.total_km,
        jobStart: job.job_start_datetime,
        jobEnd: job.job_end_datetime,
      }));

      console.log('jobs getting here', jobs);
      setJobList(jobs);
      showToast('success', 'Job List Updated', `${jobs.length} maintenance jobs loaded`);
    } catch (error) {
      console.error('Error fetching job list:', error);
      showToast('error', 'Load Failed', error.message || 'Failed to fetch job list');
    } finally {
      setLoading(false);
    }
  }, [loading, showToast]);

  // Form validation
  const validateForm = useCallback(() => {
    if (!vehicleValue) {
      showToast('error', 'Validation Error', 'Please select a vehicle');
      return false;
    }
    if (!maintenanceValue) {
      showToast('error', 'Validation Error', 'Please select maintenance type');
      return false;
    }
    if (!jobStart) {
      showToast('error', 'Validation Error', 'Please select job start date');
      return false;
    }
    if (!jobEnd) {
      showToast('error', 'Validation Error', 'Please select job end date');
      return false;
    }
    if (moment(jobEnd).isBefore(moment(jobStart))) {
      showToast('error', 'Validation Error', 'End date cannot be before start date');
      return false;
    }
    if (cost && isNaN(parseFloat(cost))) {
      showToast('error', 'Validation Error', 'Please enter a valid cost');
      return false;
    }
    if (km && isNaN(parseFloat(km))) {
      showToast('error', 'Validation Error', 'Please enter valid KM');
      return false;
    }
    return true;
  }, [vehicleValue, maintenanceValue, jobStart, jobEnd, cost, km, showToast]);

  const handleCreateJob = useCallback(async () => {
    if (!validateForm()) return;
    const payload = {
      thing_id: vehicleValue,
      maintenance_id: maintenanceValue,
      reported_issue: issues,
      work_performed: work,
      parts_replaced: parts,
      total_km: km ? parseFloat(km) : 0,
      estimated_cost: cost ? parseFloat(cost) : 0,
      job_start_datetime: moment(jobStart).format('YYYY-MM-DDTHH:mm:ss'),
      job_end_datetime: moment(jobEnd).format('YYYY-MM-DDTHH:mm:ss'),
    };
    try {
      setLoading(true);
      const response = await POSTNETWORK(
        `${BASE_URL}maintenance/maintenance_job_card/`,
        payload,
        true,
      );
      if (response && response.success !== false) {
        showToast('success', 'Success', 'Maintenance job created successfully');
        await GetJobList();
        resetForm();
      } else {
        throw new Error(response?.message || 'Failed to create job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      showToast('error', 'Creation Failed', error.message || 'Failed to create maintenance job');
    } finally {
      setLoading(false);
    }
  }, [vehicleValue, maintenanceValue, issues, work, parts, km, cost, jobStart, jobEnd, GetJobList, validateForm, showToast]);

  const resetForm = useCallback(() => {
    setVehicleValue(null);
    setMaintenanceValue(null);
    setIssues('');
    setWork('');
    setParts('');
    setCost('');
    setKm('');
    setJobStart('');
    setJobEnd('');
    setVehicleOpen(false);
    setMaintenanceOpen(false);
    showToast('info', 'Form Reset', 'Form has been reset');
  }, [showToast]);

  useFocusEffect(
    useCallback(() => {
      const initializeData = async () => {
        await Promise.all([GetVehicle(), GetMaintenance(), GetJobList()]);
      };
      initializeData();
      return () => {
        setVehicleOpen(false);
        setMaintenanceOpen(false);
      };
    }, []),
  );

  // Table column widths
  const tableColumnWidths = useMemo(
    () => ({
      serial: 60,
      vehicle: 100,
      type: 120,
      issues: 150,
      work: 150,
      parts: 120,
      cost: 80,
      start: 120,
      end: 120,
    }),
    [],
  );

  const renderTableHeader = useCallback(() => (
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderCell, { width: tableColumnWidths.serial }]}>Sl. No</Text>
      <Text style={[styles.tableHeaderCell, { width: tableColumnWidths.vehicle }]}>Vehicle</Text>
      <Text style={[styles.tableHeaderCell, { width: tableColumnWidths.type }]}>Type</Text>
      <Text style={[styles.tableHeaderCell, { width: tableColumnWidths.issues }]}>Issues</Text>
      <Text style={[styles.tableHeaderCell, { width: tableColumnWidths.work }]}>Work</Text>
      <Text style={[styles.tableHeaderCell, { width: tableColumnWidths.parts }]}>Parts</Text>
      <Text style={[styles.tableHeaderCell, { width: tableColumnWidths.cost }]}>Cost</Text>
      <Text style={[styles.tableHeaderCell, { width: tableColumnWidths.start }]}>Start</Text>
      <Text style={[styles.tableHeaderCell, { width: tableColumnWidths.end }]}>End</Text>
    </View>
  ), [tableColumnWidths]);

  const renderTableRow = useCallback(
    (job, index) => (
      <View key={job.id || index} style={styles.tableRow}>
        <Text style={[styles.tableCell, { width: tableColumnWidths.serial }]}>{index + 1}</Text>
        <Text style={[styles.tableCell, { width: tableColumnWidths.vehicle }]} numberOfLines={2}>
          {job.vehicle}
        </Text>
        <Text style={[styles.tableCell, { width: tableColumnWidths.type }]} numberOfLines={2}>
          {job.type}
        </Text>
        <Text style={[styles.tableCell, { width: tableColumnWidths.issues }]} numberOfLines={3}>
          {job.issues || '-'}
        </Text>
        <Text style={[styles.tableCell, { width: tableColumnWidths.work }]} numberOfLines={3}>
          {job.work || '-'}
        </Text>
        <Text style={[styles.tableCell, { width: tableColumnWidths.parts }]} numberOfLines={2}>
          {job.parts || '-'}
        </Text>
        <Text style={[styles.tableCell, { width: tableColumnWidths.cost }]}>
          {job.cost ? `₹${job.cost}` : '-'}
        </Text>
        <Text style={[styles.tableCell, { width: tableColumnWidths.start }]} numberOfLines={2}>
          {job.jobStart ? moment(job.jobStart).format('DD/MM/YY') : '-'}
        </Text>
        <Text style={[styles.tableCell, { width: tableColumnWidths.end }]} numberOfLines={2}>
          {job.jobEnd ? moment(job.jobEnd).format('DD/MM/YY') : '-'}
        </Text>
      </View>
    ),
    [tableColumnWidths],
  );

  return (
    <>
      <StatusBar backgroundColor="#0284c7" barStyle="light-content" />
      <Header title="Maintenance Job" onMenuPress={() => navigation.openDrawer()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {/* Maintenance Type & Vehicle Row */}
          <View style={styles.row}>
            <View style={[styles.column, { zIndex: maintenanceOpen ? zIndexCounter.current + 1 : 1 }]}>
              <Text style={styles.label}>Maintenance Type</Text>
              <DropDownPicker
                key="maintenance-dropdown"
                searchable={true}
                searchablePlaceholder="Search Maintenance Type"
                open={maintenanceOpen}
                value={maintenanceValue}
                items={maintenanceItems}
                setOpen={handleMaintenanceDropdownOpen}
                setValue={setMaintenanceValue}
                setItems={setMaintenanceItems}
                placeholder="Select Type"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                listMode={Platform.OS === 'android' ? 'MODAL' : 'SCROLLVIEW'}
                modalProps={Platform.OS === 'android' ? { animationType: 'fade', disableBorderRadius: true } : {}}
                scrollViewProps={Platform.OS === 'ios' ? { nestedScrollEnabled: true } : {}}
                maxHeight={200}
                autoScroll={true}
                zIndex={maintenanceOpen ? zIndexCounter.current + 1 : 1}
                zIndexInverse={maintenanceOpen ? 0 : 1000}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
              />
            </View>
            <View style={[styles.column, { zIndex: vehicleOpen ? zIndexCounter.current + 1 : 1 }]}>
              <Text style={styles.label}>Vehicle</Text>
              <DropDownPicker
                key="vehicle-dropdown"
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
                listMode={Platform.OS === 'android' ? 'MODAL' : 'SCROLLVIEW'}
                modalProps={Platform.OS === 'android' ? { animationType: 'fade', disableBorderRadius: true } : {}}
                scrollViewProps={Platform.OS === 'ios' ? { nestedScrollEnabled: true } : {}}
                maxHeight={200}
                autoScroll={true}
                zIndex={vehicleOpen ? zIndexCounter.current + 1 : 1}
                zIndexInverse={vehicleOpen ? 0 : 1000}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
              />
            </View>
          </View>
          {/* Reported Issues */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Reported Issues</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter reported issues"
              placeholderTextColor="#9ca3af"
              value={issues}
              multiline
              numberOfLines={3}
              onChangeText={setIssues}
            />
          </View>
          {/* Work Performed */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Work Performed</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe work performed"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              value={work}
              onChangeText={setWork}
            />
          </View>
          {/* Parts Replaced */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Parts Replaced</Text>
            <TextInput
              style={styles.input}
              placeholder="List parts replaced"
              placeholderTextColor="#9ca3af"
              value={parts}
              onChangeText={setParts}
            />
          </View>
          {/* Cost and KM Row */}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Cost (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter cost"
                placeholderTextColor="#9ca3af"
                value={cost}
                onChangeText={setCost}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Total KM</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter total KM"
                placeholderTextColor="#9ca3af"
                value={km}
                onChangeText={setKm}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          {/* Dates Row */}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Job Start Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setCalendarVisible({ start: true, end: false })}
              >
                <Text style={styles.dateButtonText}>
                  {jobStart ? moment(jobStart).format('DD MMM YYYY') : 'Select Start Date'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Job End Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setCalendarVisible({ start: false, end: true })}
              >
                <Text style={styles.dateButtonText}>
                  {jobEnd ? moment(jobEnd).format('DD MMM YYYY') : 'Select End Date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetForm}>
              <Text style={styles.resetButtonText}>Reset Form</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
              onPress={handleCreateJob}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>{loading ? 'Creating...' : 'Create Job'}</Text>
            </TouchableOpacity>
          </View>
          {/* Maintenance Job List */}
          <Text style={styles.tableTitle}>Maintenance Job List ({jobList.length})</Text>
          {jobList.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableContainer}>
              <View>
                {renderTableHeader()}
                <ScrollView style={styles.tableBody} nestedScrollEnabled={true}>
                  {jobList.map((job, index) => renderTableRow(job, index))}
                </ScrollView>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No maintenance jobs found</Text>
            </View>
          )}
        </ScrollView>
        <Loader visible={loading} />
      </KeyboardAvoidingView>
      {/* Calendar Modals */}
      <Modal visible={calendarVisible.start || calendarVisible.end} transparent animationType="slide">
        <View style={styles.calendarModal}>
          <Text style={styles.calendarTitle}>
            Select {calendarVisible.start ? 'Start' : 'End'} Date
          </Text>
          <Calendar
            onDayPress={day => handleDateSelect(day, calendarVisible.start ? 'start' : 'end')}
            markedDates={{
              [jobStart]: { selected: true, selectedColor: '#0284c7' },
              [jobEnd]: { selected: true, selectedColor: '#10b981' },
            }}
            minDate={calendarVisible.end ? jobStart : undefined}
            theme={{
              selectedDayBackgroundColor: '#0284c7',
              todayTextColor: '#0284c7',
              arrowColor: '#0284c7',
            }}
          />
          <TouchableOpacity
            onPress={() => setCalendarVisible({ start: false, end: false })}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Close Calendar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9fafb',
    paddingBottom: 48,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  inputBlock: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#374151',
    fontSize: 15,
  },
  input: {
    color: '#111827',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  dropdown: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 8,
    height: 50,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    borderColor: '#d1d5db',
    borderWidth: 1.5,
    borderRadius: 8,
    maxHeight: 200,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 15,
    color: '#111827',
  },
  dropdownPlaceholder: {
    color: '#9ca3af',
    fontSize: 15,
  },
  dateButton: {
    height: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#d1d5db',
    borderWidth: 1.5,
    borderRadius: 8,
  },
  dateButtonText: {
    color: '#374151',
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    marginBottom: 28,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#0284c7',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  tableTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  tableContainer: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderCell: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  tableBody: {
    maxHeight: 320,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  tableCell: {
    color: '#374151',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyText: {
    fontSize: 17,
    color: '#6b7280',
    textAlign: 'center',
  },
  calendarModal: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    margin: 24,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  calendarTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#0284c7',
    textAlign: 'center',
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: '#6b7280',
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default MaintenanceJobScreen;