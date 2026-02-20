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
import { useStatusBarHeight } from '../../constants/config';
import { BASE_URL } from '../../constants/url';
import { GETNETWORK, POSTNETWORK } from '../../utils/Network';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import { Loader } from '../../components/Loader';
import Toast from 'react-native-toast-message';
import theme from '../../theme';

const { width } = Dimensions.get('window');

const MaintenanceJobScreen = ({ navigation }) => {
  const statusBarHeight = useStatusBarHeight();
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

  // Validation states
  const [errors, setErrors] = useState({
    vehicle: '',
    maintenance: '',
    issues: '',
    work: '',
    parts: '',
    cost: '',
    km: '',
    jobStart: '',
    jobEnd: '',
  });

  const zIndexCounter = useRef(1000);

  const isFocused = useIsFocused();

  // Reset state when screen loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        // This runs when the screen loses focus (navigating away)
        resetForm();
        setLoading(false);
        setVehicleOpen(false);
        setMaintenanceOpen(false);
        setCalendarVisible({ start: false, end: false });
      };
    }, [])
  );


  // Toast configuration
  const showToast = useCallback((type, title, message) => {
    Toast.show({
      type,
      position: 'top',
      text1: title,
      text2: message,
      visibilityTime: type === 'error' ? 4000 : 3000,
      autoHide: true,
      topOffset: statusBarHeight,
    });
  }, [statusBarHeight]);

  // Clear specific error
  const clearError = useCallback((field) => {
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  }, []);

  // Validate individual fields
  const validateField = useCallback((field, value) => {
    let error = '';

    switch (field) {
      case 'vehicle':
        if (!value) error = 'Vehicle selection is required';
        break;
      case 'maintenance':
        if (!value) error = 'Maintenance type is required';
        break;
      case 'issues':
        if (!value.trim()) error = 'Reported issues are required';
        else if (value.trim().length < 5) error = 'Issues description should be at least 5 characters';
        else if (value.trim().length > 500) error = 'Issues description should not exceed 500 characters';
        break;
      case 'work':
        if (!value.trim()) error = 'Work performed description is required';
        else if (value.trim().length < 5) error = 'Work description should be at least 5 characters';
        else if (value.trim().length > 500) error = 'Work description should not exceed 500 characters';
        break;
      case 'parts':
        if (value.trim().length > 200) error = 'Parts description should not exceed 200 characters';
        break;
      case 'cost':
        if (value && isNaN(parseFloat(value))) error = 'Cost must be a valid number';
        else if (value && parseFloat(value) < 0) error = 'Cost cannot be negative';
        else if (value && parseFloat(value) > 10000000) error = 'Cost seems too high';
        break;
      case 'km':
        if (value && isNaN(parseFloat(value))) error = 'KM must be a valid number';
        else if (value && parseFloat(value) < 0) error = 'KM cannot be negative';
        else if (value && parseFloat(value) > 1000000) error = 'KM seems too high';
        break;
      case 'jobStart':
        if (!value) error = 'Job start date is required';
        break;
      case 'jobEnd':
        if (!value) error = 'Job end date is required';
        else if (jobStart && moment(value).isBefore(moment(jobStart))) {
          error = 'End date cannot be before start date';
        }
        break;
      default:
        break;
    }

    return error;
  }, [jobStart]);

  // Real-time validation on change
  const handleVehicleChange = useCallback((value) => {
    setVehicleValue(value);
    if (value) clearError('vehicle');
  }, [clearError]);

  const handleMaintenanceChange = useCallback((value) => {
    setMaintenanceValue(value);
    if (value) clearError('maintenance');
  }, [clearError]);

  const handleIssuesChange = useCallback((value) => {
    setIssues(value);
    if (value.trim().length >= 5) clearError('issues');
  }, [clearError]);

  const handleWorkChange = useCallback((value) => {
    setWork(value);
    if (value.trim().length >= 5) clearError('work');
  }, [clearError]);

  const handlePartsChange = useCallback((value) => {
    setParts(value);
    if (value.trim().length <= 200) clearError('parts');
  }, [clearError]);

  const handleCostChange = useCallback((value) => {
    // Allow only numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Allow only one decimal point
    const decimalCount = (numericValue.match(/\./g) || []).length;
    const finalValue = decimalCount > 1 ? numericValue.slice(0, -1) : numericValue;

    setCost(finalValue);

    if (!finalValue || (!isNaN(parseFloat(finalValue)) && parseFloat(finalValue) >= 0)) {
      clearError('cost');
    }
  }, [clearError]);

  const handleKmChange = useCallback((value) => {
    // Allow only numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Allow only one decimal point
    const decimalCount = (numericValue.match(/\./g) || []).length;
    const finalValue = decimalCount > 1 ? numericValue.slice(0, -1) : numericValue;

    setKm(finalValue);

    if (!finalValue || (!isNaN(parseFloat(finalValue)) && parseFloat(finalValue) >= 0)) {
      clearError('km');
    }
  }, [clearError]);

  const handleJobStartChange = useCallback((date) => {
    setJobStart(date);
    if (date) clearError('jobStart');
    // Also validate end date if it exists
    if (jobEnd && moment(jobEnd).isBefore(moment(date))) {
      setErrors(prev => ({
        ...prev,
        jobEnd: 'End date cannot be before start date'
      }));
    } else if (jobEnd) {
      clearError('jobEnd');
    }
  }, [jobEnd, clearError]);

  const handleJobEndChange = useCallback((date) => {
    setJobEnd(date);
    if (date) clearError('jobEnd');
  }, [clearError]);

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
      handleJobStartChange(date.dateString);
      showToast('success', 'Start Date Selected', moment(date.dateString).format('DD MMM YYYY'));
    } else {
      handleJobEndChange(date.dateString);
      showToast('success', 'End Date Selected', moment(date.dateString).format('DD MMM YYYY'));
    }
    setCalendarVisible(prev => ({ ...prev, [type]: false }));
  }, [handleJobStartChange, handleJobEndChange, showToast]);

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
    if (loading) return;
    setLoading(true);
    const url = `${BASE_URL}maintenance/maintenance_job_card/`;
    try {
      const response = await GETNETWORK(url, true);
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
      setJobList(jobs);
      showToast('success', 'Job List Updated', `${jobs.length} maintenance jobs loaded`);
    } catch (error) {
      console.error('Error fetching job list:', error);
      showToast('error', 'Load Failed', error.message || 'Failed to fetch job list');
    } finally {
      setLoading(false);
    }
  }, [loading, showToast]);

  // Comprehensive form validation
  const validateForm = useCallback(() => {
    const newErrors = {
      vehicle: validateField('vehicle', vehicleValue),
      maintenance: validateField('maintenance', maintenanceValue),
      issues: validateField('issues', issues),
      work: validateField('work', work),
      parts: validateField('parts', parts),
      cost: validateField('cost', cost),
      km: validateField('km', km),
      jobStart: validateField('jobStart', jobStart),
      jobEnd: validateField('jobEnd', jobEnd),
    };

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== '');

    if (hasErrors) {
      // Find the first field with error and show toast
      const firstErrorField = Object.keys(newErrors).find(key => newErrors[key] !== '');
      if (firstErrorField) {
        showToast('error', 'Validation Error', `Please check the ${firstErrorField.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
      }
      return false;
    }

    return true;
  }, [vehicleValue, maintenanceValue, issues, work, parts, cost, km, jobStart, jobEnd, validateField, showToast]);

  const handleCreateJob = useCallback(async () => {
    if (!validateForm()) return;

    const payload = {
      thing_id: vehicleValue,
      maintenance_id: maintenanceValue,
      reported_issue: issues.trim(),
      work_performed: work.trim(),
      parts_replaced: parts.trim(),
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
    setErrors({
      vehicle: '',
      maintenance: '',
      issues: '',
      work: '',
      parts: '',
      cost: '',
      km: '',
      jobStart: '',
      jobEnd: '',
    });
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

  // Error message component
  const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return <Text style={styles.errorText}>{message}</Text>;
  };

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
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
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
              <Text style={styles.label}>Maintenance Type *</Text>
              <DropDownPicker
                key="maintenance-dropdown"
                searchable={true}
                searchablePlaceholder="Search Maintenance Type"
                open={maintenanceOpen}
                value={maintenanceValue}
                items={maintenanceItems}
                setOpen={handleMaintenanceDropdownOpen}
                setValue={handleMaintenanceChange}
                setItems={setMaintenanceItems}
                placeholder="Select Type"
                style={[
                  styles.dropdown,
                  errors.maintenance && styles.inputError
                ]}
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
              <ErrorMessage message={errors.maintenance} />
            </View>
            <View style={[styles.column, { zIndex: vehicleOpen ? zIndexCounter.current + 1 : 1 }]}>
              <Text style={styles.label}>Vehicle *</Text>
              <DropDownPicker
                key="vehicle-dropdown"
                searchable={true}
                searchablePlaceholder="Search Vehicle"
                open={vehicleOpen}
                value={vehicleValue}
                items={vehicleItems}
                setOpen={handleVehicleDropdownOpen}
                setValue={handleVehicleChange}
                setItems={setVehicleItems}
                placeholder="Select Vehicle"
                style={[
                  styles.dropdown,
                  errors.vehicle && styles.inputError
                ]}
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
              <ErrorMessage message={errors.vehicle} />
            </View>
          </View>

          {/* Reported Issues */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Reported Issues *</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.issues && styles.inputError
              ]}
              placeholder="Enter reported issues (minimum 5 characters)"
              placeholderTextColor={theme.colors.textPlaceholder}
              value={issues}
              multiline
              numberOfLines={3}
              onChangeText={handleIssuesChange}
              onBlur={() => {
                const error = validateField('issues', issues);
                if (error) setErrors(prev => ({ ...prev, issues: error }));
              }}
            />
            <ErrorMessage message={errors.issues} />
          </View>

          {/* Work Performed */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Work Performed *</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.work && styles.inputError
              ]}
              placeholder="Describe work performed (minimum 5 characters)"
              placeholderTextColor={theme.colors.textPlaceholder}
              multiline
              numberOfLines={3}
              value={work}
              onChangeText={handleWorkChange}
              onBlur={() => {
                const error = validateField('work', work);
                if (error) setErrors(prev => ({ ...prev, work: error }));
              }}
            />
            <ErrorMessage message={errors.work} />
          </View>

          {/* Parts Replaced */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Parts Replaced</Text>
            <TextInput
              style={[
                styles.input,
                errors.parts && styles.inputError
              ]}
              placeholder="List parts replaced (optional)"
              placeholderTextColor={theme.colors.textPlaceholder}
              value={parts}
              onChangeText={handlePartsChange}
              onBlur={() => {
                const error = validateField('parts', parts);
                if (error) setErrors(prev => ({ ...prev, parts: error }));
              }}
            />
            <ErrorMessage message={errors.parts} />
          </View>

          {/* Cost and KM Row */}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Cost (₹)</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.cost && styles.inputError
                ]}
                placeholder="Enter cost (optional)"
                placeholderTextColor={theme.colors.textPlaceholder}
                value={cost}
                onChangeText={handleCostChange}
                keyboardType="decimal-pad"
                onBlur={() => {
                  const error = validateField('cost', cost);
                  if (error) setErrors(prev => ({ ...prev, cost: error }));
                }}
              />
              <ErrorMessage message={errors.cost} />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Total KM</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.km && styles.inputError
                ]}
                placeholder="Enter total KM (optional)"
                placeholderTextColor={theme.colors.textPlaceholder}
                value={km}
                onChangeText={handleKmChange}
                keyboardType="decimal-pad"
                onBlur={() => {
                  const error = validateField('km', km);
                  if (error) setErrors(prev => ({ ...prev, km: error }));
                }}
              />
              <ErrorMessage message={errors.km} />
            </View>
          </View>

          {/* Dates Row */}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Job Start Date *</Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  errors.jobStart && styles.inputError
                ]}
                onPress={() => setCalendarVisible({ start: true, end: false })}
              >
                <Text style={styles.dateButtonText}>
                  {jobStart ? moment(jobStart).format('DD MMM YYYY') : 'Select Start Date'}
                </Text>
              </TouchableOpacity>
              <ErrorMessage message={errors.jobStart} />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Job End Date *</Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  errors.jobEnd && styles.inputError
                ]}
                onPress={() => setCalendarVisible({ start: false, end: true })}
              >
                <Text style={styles.dateButtonText}>
                  {jobEnd ? moment(jobEnd).format('DD MMM YYYY') : 'Select End Date'}
                </Text>
              </TouchableOpacity>
              <ErrorMessage message={errors.jobEnd} />
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
              [jobStart]: { selected: true, selectedColor: theme.colors.primary },
              [jobEnd]: { selected: true, selectedColor: theme.colors.success },
            }}
            minDate={calendarVisible.end ? jobStart : undefined}
            theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: '#E2E8F0',
                selectedDayBackgroundColor: '#4F46E5',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#818CF8',
                dayTextColor: '#FFFFFF',
                textDisabledColor: '#94A3B8',
                dotColor: '#4F46E5',
                selectedDotColor: '#FFFFFF',
                arrowColor: '#4F46E5',
                monthTextColor: '#FFFFFF',
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
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
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    paddingBottom: 48,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  column: {
    flex: 1,
  },
  inputBlock: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    fontSize: theme.typography.sm,
  },
  input: {
    color: theme.colors.text,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    fontSize: theme.typography.base,
    ...theme.shadows.sm,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.md,
  },
  dropdown: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.radius.md,
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    ...theme.shadows.sm,
  },
  dropdownContainer: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderRadius: theme.radius.md,
    maxHeight: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    ...theme.shadows.md,
  },
  dropdownText: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
  },
  dropdownPlaceholder: {
    color: theme.colors.textPlaceholder,
    fontSize: theme.typography.sm,
  },
  dateButton: {
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderRadius: theme.radius.md,
    ...theme.shadows.sm,
  },
  dateButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  resetButton: {
    backgroundColor: theme.colors.borderDark,
    ...theme.shadows.sm,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.glow,
  },
  disabledButton: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
    fontSize: theme.typography.base,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.bold,
    fontSize: theme.typography.base,
  },
  tableTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  tableContainer: {
    marginBottom: theme.spacing.xl,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    ...theme.shadows.md,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  tableHeaderCell: {
    color: theme.colors.white,
    fontWeight: theme.typography.semibold,
    fontSize: theme.typography.sm,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  tableBody: {
    maxHeight: 320,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderLight,
    backgroundColor: 'transparent',
  },
  tableCell: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.xs,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  emptyState: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...theme.shadows.sm,
  },
  emptyText: {
    fontSize: theme.typography.base,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  calendarModal: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  calendarTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  closeButton: {
    backgroundColor: theme.colors.textMuted,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  closeButtonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.semibold,
    fontSize: theme.typography.sm,
  },
  // Error styles
  inputError: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.errorLight,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.xs,
    marginTop: theme.spacing.xxs,
    marginLeft: theme.spacing.xxs,
    fontWeight: theme.typography.medium,
  },
});

export default MaintenanceJobScreen;