import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Image,
  StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import Geolocation from '@react-native-community/geolocation';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import Header from '../../components/Header';
import { GETNETWORK } from '../../utils/Network';
import { useStatusBarHeight } from '../../constants/config';
import { BASE_URL } from '../../constants/url';
import { getObjByKey, storeObjByKey } from '../../utils/Storage';
import { Icon } from '@rneui/themed';
import { pick } from '@react-native-documents/picker';
import { useAppTheme } from '../../theme/ThemeContext';
import { makeFormStyles } from '../../styles/FormStyles';

const TripStart = ({ navigation, route, onClose }) => {
  const { theme, isDark } = useAppTheme();
  const formStyles = makeFormStyles(theme);
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const statusBarHeight = useStatusBarHeight();
  // Form state
  const [startDatetime, setStartDatetime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [startAddress, setStartAddress] = useState('');
  const [startKm, setStartKm] = useState('');
  const [startLat, setStartLat] = useState('');
  const [startLng, setStartLng] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [attachments, setAttachments] = useState([]);

  // Location state
  const [location, setLocation] = useState({});

  // Checklist state
  const [inspectionItems, setInspectionItems] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [inspectionResults, setInspectionResults] = useState({});
  const [selectedStatusDetails, setSelectedStatusDetails] = useState({});
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

  // Initialize
  useEffect(() => {
    fetchChecklistAndStatus();
  }, []);

  // Date/Time Picker Handlers
  const onChangeDateTime = (event, selectedDate) => {
    const currentDate = selectedDate || startDatetime;
    setShowPicker(Platform.OS === 'ios');
    setStartDatetime(currentDate);

    if (event.type === 'dismissed') return;

    if (pickerMode === 'date') {
      setPickerMode('time');
      if (Platform.OS === 'android') {
        setShowPicker(true);
      }
    } else {
      setPickerMode('date');
      setFormErrors(prev => ({ ...prev, date: null }));
      showToast('success', 'Date Selected', moment(currentDate).format('DD MMM YYYY, hh:mm A'));
    }
  };

  const showDatePicker = () => {
    if (moment(startDatetime).isAfter(moment(), 'minute')) {
      showToast('error', 'Invalid Date', 'Cannot select future dates');
      return;
    }
    setPickerMode('date');
    setShowPicker(true);
  };

  // Location Handlers
  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => resolve(position),
          error => reject(error),
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
        );
      });
      const { latitude, longitude } = position.coords;
      await reverseGeocode(latitude, longitude);
      setStartLat(latitude.toString());
      setStartLng(longitude.toString());
      setFormErrors(prev => ({ ...prev, latitude: null, longitude: null }));
      showToast('success', 'Location Fetched', 'Current location retrieved successfully');
    } catch (error) {
      console.error('Error getting location:', error);
      let message = 'An unexpected error occurred. Please try again.';
      if (error.code === 1) message = 'Location permission is required.';
      else if (error.code === 2) message = 'Could not determine your location.';
      else if (error.code === 3) message = 'Location request timed out.';
      showToast('error', 'Location Error', message);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/reverse?api_key=eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImRhZmY2MTE0ZmNhYzRhZjViYTUyZjY0ZWMyMTRlYTI5IiwiaCI6Im11cm11cjY0In0=&point.lon=${longitude}&point.lat=${latitude}`
      );
      const result = await response.json();
      const firstFeature = result?.features?.[0];
      if (firstFeature?.properties) {
        const { street, label } = firstFeature.properties;
        const locationData = { street, label };
        setLocation(locationData);
        setStartAddress(label);
        storeObjByKey('location', locationData);
        showToast('success', 'Address Fetched', label);
      } else {
        showToast('error', 'Geocode Error', 'No valid address found');
      }
    } catch (error) {
      console.error('Error fetching reverse geocode:', error);
      showToast('error', 'Geocode Error', 'Failed to fetch address');
    }
  };

  // Attachment Handlers
  const handleAttachment = async () => {
    try {
      const pickResults = await pick();
      if (pickResults && pickResults.length > 0) {
        const pickResult = pickResults[0];
        if (pickResult.size && pickResult.size > 10 * 1024 * 1024) {
          showToast('error', 'File Too Large', 'Please select a file smaller than 10MB');
          return;
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(pickResult.type)) {
          showToast('error', 'Invalid File Type', 'Please select JPEG, PNG, or PDF files only');
          return;
        }
        setAttachments([{
          uri: pickResult.uri,
          name: pickResult.name,
          type: pickResult.type,
        }]);
        showToast('success', 'File Selected', 'Attachment added successfully');
      }
    } catch (error) {
      console.error('Error picking file:', error);
      showToast('error', 'File Selection Failed', 'Failed to select file. Please try again.');
    }
  };

  const removeAttachment = () => {
    setAttachments([]);
    showToast('info', 'Attachment Removed', 'File has been removed');
  };

  // Checklist Handlers
  const fetchChecklistAndStatus = async () => {
    setLoading(true);
    try {
      const response = await GETNETWORK(`${BASE_URL}maintenance/checklist/`, true);
      const data = response?.data || [];
      const rawStatus = data.flatMap(item => item.checklist_value.map(cv => cv.key));
      const uniqueStatus = [...new Set(rawStatus.map(key => key.toLowerCase()))];
      const statusOptionMapped = uniqueStatus.map(key => ({
        label: capitalize(key),
        value: key,
        color: getStatusColor(key),
      }));
      const inspectionMapped = data.map(item => ({
        id: item.id,
        name: item.checklist_name,
      }));
      setStatusOptions(statusOptionMapped);
      setInspectionItems(inspectionMapped);
      showToast('success', 'Checklist Loaded', `${inspectionMapped.length} items loaded`);
    } catch (error) {
      console.error('Failed to fetch checklist/status', error);
      setError('Failed to load checklist data');
      showToast('error', 'Load Failed', 'Failed to fetch checklist data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusSelect = useCallback(
    (itemId, value) => {
      const selectedStatus = statusOptions.find(status => status.value === value);
      setInspectionResults(prev => ({ ...prev, [itemId]: value }));
      setSelectedStatusDetails(prev => ({ ...prev, [itemId]: selectedStatus || {} }));
      setOpenDropdowns(prev => ({ ...prev, [itemId]: false }));
      setFormErrors(prev => ({ ...prev, checklist: null }));
    },
    [statusOptions]
  );

  // Helper functions
  const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  const getStatusColor = key => {
    const lower = key.toLowerCase();
    if (lower === 'ok') return '#22c55e';
    if (lower === 'attention' || lower === 'repair') return '#eab308';
    if (lower === 'replace') return theme.colors.error;
    return '#94a3b8';
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!startAddress) errors.address = 'Please enter or fetch a location';
    if (!startKm || isNaN(startKm) || parseFloat(startKm) <= 0) errors.startKm = 'Please enter a valid odometer reading';
    if (!startLat) errors.latitude = 'Please fetch location to set latitude';
    if (!startLng) errors.longitude = 'Please fetch location to set longitude';
    if (Object.keys(inspectionResults).length !== inspectionItems.length) {
      errors.checklist = 'Please complete all checklist items';
    }
    if (moment(startDatetime).isAfter(moment(), 'minute')) {
      errors.date = 'Cannot select future dates';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submission
  const handleSubmit = async () => {
    console.log('handleSubmit: for start trip', route.params?.trip?.trip_assignment_id);
    if (!validateForm()) {
      showToast('error', 'Validation Error', 'Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const loginRes = await getObjByKey('loginResponse');
      const token = loginRes?.data?.access_token;
      if (!token) throw new Error('Authentication token not available');

      const startKmNum = Number(startKm);
      const startLatNum = Number(startLat);
      const startLngNum = Number(startLng);
      if (Number.isNaN(startKmNum) || Number.isNaN(startLatNum) || Number.isNaN(startLngNum)) {
        showToast('error', 'Validation Error', 'Please enter valid numbers for odometer and location');
        setIsSubmitting(false);
        return;
      }

      const checklistPayload = inspectionItems
        .filter(item => inspectionResults[item.id] != null && String(inspectionResults[item.id]).trim() !== '')
        .map(item => ({
          checklist_master_id: item.id,
          selected_value: String(inspectionResults[item.id]).toLowerCase().replace(/\s+/g, '_'),
        }));

      const tripAssignmentId = route.params?.trip?.trip_assignment_id;
      const url = `${BASE_URL}trips/trip_start/${tripAssignmentId}/`;
      let response;

      if (attachments.length > 0) {
        const formdata = new FormData();
        formdata.append('start_address', String(startAddress).trim());
        formdata.append('start_datetime', moment(startDatetime).format('YYYY-MM-DDTHH:mm:ss'));
        formdata.append('start_km', startKmNum);
        formdata.append('start_lat', startLatNum);
        formdata.append('start_lng', startLngNum);
        formdata.append('checklist', JSON.stringify(checklistPayload));
        const file = attachments[0];
        formdata.append('uploaded_proof', {
          uri: file.uri,
          name: file.name || 'proof',
          type: file.type || 'image/jpeg',
        });
        response = await fetch(url, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formdata,
        });
      } else {
        const jsonBody = {
          start_address: String(startAddress).trim(),
          start_datetime: moment(startDatetime).format('YYYY-MM-DDTHH:mm:ss'),
          start_km: startKmNum,
          start_lat: startLatNum,
          start_lng: startLngNum,
          checklist: checklistPayload,
        };
        response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonBody),
        });
      }

      let result;
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      if (contentType && contentType.includes('application/json') && text && text.trim().length > 0) {
        try {
          result = JSON.parse(text);
        } catch {
          result = { status: 'failed', msg: 'Invalid response from server' };
        }
      } else {
        result = { status: 'failed', msg: response.ok ? 'Invalid response from server' : (text || `Request failed (${response.status})`) };
      }

      if (!response.ok) {
        throw new Error(result.msg || `Request failed (${response.status})`);
      }
      if (result.status === 'failed') {
        throw new Error(result.msg || 'Failed to start trip');
      }

      const dismiss = () => {
        if (onClose) onClose();
        else if (navigation?.goBack) navigation.goBack();
      };
      Alert.alert('Success', 'Trip started successfully!', [
        { text: 'OK', onPress: dismiss },
      ]);
      showToast('success', 'Trip Started', 'Trip started successfully');
    } catch (error) {
      if (__DEV__) console.error('Trip start error:', error);
      let errorMessage = error?.message || 'Failed to start trip. Please try again.';
      if (errorMessage.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (errorMessage.includes('401')) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (errorMessage.includes('Expecting value') || errorMessage.includes('JSON')) {
        errorMessage = 'Server could not process the request. Please check your data and try again.';
      }
      showToast('error', 'Submission Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe menu press handler
  const handleMenuPress = () => {
    if (onClose) {
      onClose();
    } else if (navigation?.openDrawer) {
      navigation.openDrawer();
    } else {
      console.warn('Navigation not available');
      if (onClose) onClose();
    }
  };

  // Render Checklist Item – stacked layout so dropdown has full width and doesn’t look collapsed
  const renderItem = ({ item }) => {
    const selectedStatus = inspectionResults[item.id];
    const selectedStatusObj = statusOptions.find(opt => opt.value === selectedStatus);
    const isOpen = openDropdowns[item.id] || false;
    const zIndex = isOpen ? zIndexCounter.current++ : 1;

    return (
      <View style={[styles.tableRow, { zIndex }]}>
        <Text style={styles.itemName}>{item.name}</Text>
        {selectedStatus && (
          <Text style={[styles.selectedStatusText, { color: selectedStatusObj?.color, marginBottom: theme.spacing.xs }]}>
            {selectedStatusObj?.label}
          </Text>
        )}
        <View style={[styles.statusDropdownContainer, { zIndex: isOpen ? zIndex + 1 : 1 }]}>
          <DropDownPicker
            open={isOpen}
            value={selectedStatus}
            items={statusOptions}
            setOpen={callback => {
              const value = typeof callback === 'function' ? callback(openDropdowns[item.id]) : callback;
              setOpenDropdowns(prev => ({ ...prev, [item.id]: value }));
            }}
            setValue={callback => {
              const selectedValue = typeof callback === 'function' ? callback(selectedStatus) : callback;
              handleStatusSelect(item.id, selectedValue);
            }}
            setItems={() => { }}
            placeholder="Select Status"
            style={[styles.statusDropdown, selectedStatusObj && { backgroundColor: selectedStatusObj.color + '20' }]}
            textStyle={styles.statusDropdownText}
            placeholderStyle={styles.statusDropdownPlaceholder}
            labelStyle={selectedStatusObj && { color: selectedStatusObj.color }}
            listItemLabelStyle={opt => ({ color: opt.color, fontWeight: '600' })}
            searchable={true}
            showTickIcon={false}
            listMode="MODAL"
            modalProps={{ animationType: 'fade' }}
            ArrowDownIconComponent={() => (
              <View style={[styles.statusIndicator, selectedStatusObj && { backgroundColor: selectedStatusObj.color }]} />
            )}
            zIndex={isOpen ? zIndex + 3 : 1}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={formStyles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={formStyles.loadingText}>Loading trip start data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={formStyles.errorContainer}>
        <Icon name="error-outline" size={48} color={theme.colors.error} />
        <Text style={[formStyles.modalTitle, { marginTop: theme.spacing.sm }]}>Error loading data</Text>
        <Text style={formStyles.errorSubText}>{error}</Text>
        <TouchableOpacity style={formStyles.retryButton} onPress={fetchChecklistAndStatus}>
          <Text style={formStyles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={formStyles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Header title="Trip Start" onMenuPress={handleMenuPress} showCloseButton={!!onClose} />
        <ScrollView contentContainerStyle={formStyles.scrollContainer}>
          <View style={formStyles.sectionCard}>
            <Text style={formStyles.sectionHeader}>Trip details</Text>
            {/* Date & Time Picker */}
            <View style={formStyles.inputItem}>
              <Text style={formStyles.label}>Date & Time *</Text>
              <TouchableOpacity style={formStyles.dateButton} onPress={showDatePicker}>
                <Text style={formStyles.dateButtonText}>
                  {moment(startDatetime).format('DD MMM YYYY, hh:mm A')}
                </Text>
              </TouchableOpacity>
              {formErrors.date && <Text style={formStyles.errorText}>{formErrors.date}</Text>}
              {Platform.OS === 'android' && showPicker && (
                <DateTimePicker
                  value={startDatetime}
                  mode={pickerMode}
                  display="default"
                  onChange={onChangeDateTime}
                  is24Hour={true}
                  maximumDate={new Date()}
                  positiveButton={{ label: 'OK', textColor: theme.colors.primary }}
                  negativeButton={{ label: 'Cancel', textColor: theme.colors.error }}
                />
              )}
              {Platform.OS === 'ios' && (
                <Modal visible={showPicker} transparent={true} animationType="slide">
                  <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
                    <View style={styles.iosOverlay} />
                  </TouchableWithoutFeedback>
                  <View style={styles.iosPickerContainer}>
                    <DateTimePicker
                      value={startDatetime}
                      mode={pickerMode}
                      display="spinner"
                      onChange={onChangeDateTime}
                      is24Hour={true}
                      maximumDate={new Date()}
                    />
                    <TouchableOpacity
                      style={styles.iosDoneButton}
                      onPress={() => {
                        setShowPicker(false);
                        if (pickerMode === 'time') setPickerMode('date');
                      }}
                    >
                      <Text style={styles.iosDoneButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </Modal>
              )}
            </View>

            {/* Location */}
            <View style={formStyles.inputItem}>
              <Text style={formStyles.label}>Location *</Text>
              <View style={formStyles.inputRow}>
                <TextInput
                  style={[formStyles.input, { flex: 1 }, formErrors.address && formStyles.errorInput]}
                  placeholderTextColor={theme.colors.textPlaceholder}
                  placeholder="Enter or fetch location"
                  value={startAddress}
                  onChangeText={text => {
                    setStartAddress(text);
                    setFormErrors(prev => ({ ...prev, address: null }));
                  }}
                />
                <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
                  <Text style={styles.locationButtonText}>Get Current</Text>
                </TouchableOpacity>
              </View>
              {formErrors.address && <Text style={formStyles.errorText}>{formErrors.address}</Text>}
            </View>

            {/* Odometer */}
            <View style={formStyles.inputItem}>
              <Text style={formStyles.label}>Odometer (km) *</Text>
              <TextInput
                style={[formStyles.input, formErrors.startKm && formStyles.errorInput]}
                value={startKm}
                onChangeText={text => {
                  setStartKm(text);
                  setFormErrors(prev => ({ ...prev, startKm: null }));
                }}
                placeholder="Enter odometer reading"
                keyboardType="numeric"
                placeholderTextColor={theme.colors.textPlaceholder}
              />
              {formErrors.startKm && <Text style={formStyles.errorText}>{formErrors.startKm}</Text>}
            </View>

            {/* Coordinates */}
            {/* <View style={styles.coordinateContainer}>
            <View style={[styles.inputItem, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Latitude *</Text>
              <TextInput
                style={[styles.input, formErrors.latitude && styles.errorInput]}
                value={startLat}
                placeholder="Auto-filled from location"
                keyboardType="numeric"
                placeholderTextColor={theme.colors.textPlaceholder}
                editable={false}
              />
              {formErrors.latitude && <Text style={styles.errorText}>{formErrors.latitude}</Text>}
            </View>
            <View style={[styles.inputItem, { flex: 1 }]}>
              <Text style={styles.label}>Longitude *</Text>
              <TextInput
                style={[styles.input, formErrors.longitude && styles.errorInput]}
                value={startLng}
                placeholder="Auto-filled from location"
                keyboardType="numeric"
                placeholderTextColor={theme.colors.textPlaceholder}
                editable={false}
              />
              {formErrors.longitude && <Text style={styles.errorText}>{formErrors.longitude}</Text>}
            </View>
          </View> */}

            {/* Attachments */}
            <View style={formStyles.inputItem}>
              <Text style={formStyles.label}>Attachments</Text>
              {attachments.length > 0 ? (
                <View style={styles.attachmentPreviewContainer}>
                  {attachments[0].type?.startsWith('image/') ? (
                    <Image
                      source={{ uri: attachments[0].uri }}
                      style={styles.attachmentImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.filePreview}>
                      <Icon name="insert-drive-file" size={40} color={theme.colors.primary} />
                      <Text style={styles.fileName} numberOfLines={1}>
                        {attachments[0].name}
                      </Text>
                    </View>
                  )}
                  <View style={styles.attachmentActions}>
                    <TouchableOpacity style={styles.removeButton} onPress={removeAttachment}>
                      <Icon name="close" size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={styles.attachmentButton} onPress={handleAttachment}>
                  <Text style={styles.attachmentButtonText}>Choose File (Max 10MB)</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Checklist Section */}
          <View style={formStyles.sectionCard}>
            <Text style={formStyles.sectionHeader}>Pre-Trip Checklist *</Text>
            {inspectionItems.length === 0 ? (
              <Text style={styles.noChecklistText}>No checklist items available</Text>
            ) : (
              <View style={formStyles.tableContainer}>
                <FlatList
                  data={inspectionItems}
                  renderItem={renderItem}
                  keyExtractor={item => item.id.toString()}
                  scrollEnabled={false}
                />
                {formErrors.checklist && <Text style={formStyles.errorText}>{formErrors.checklist}</Text>}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[formStyles.primaryButton, isSubmitting && formStyles.primaryButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.white} size="small" />
            ) : (
              <Text style={formStyles.primaryButtonText}>Start Trip</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
        <Toast />
      </KeyboardAvoidingView>
    </>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  locationButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    minHeight: 52,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.glow,
  },
  locationButtonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.semibold,
    fontSize: theme.typography.sm,
  },
  tableRow: {
    flexDirection: 'column',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    minHeight: 72,
  },
  itemName: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    marginBottom: theme.spacing.xxs,
  },
  selectedStatusText: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.medium,
  },
  statusDropdownContainer: {
    width: '100%',
    marginTop: theme.spacing.xs,
  },
  statusDropdown: {
    backgroundColor: theme.colors.inputBg,
    borderColor: theme.colors.inputBorder,
    borderWidth: 1.5,
    borderRadius: theme.radius.md,
    minHeight: 52,
    height: 52,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 0,
    ...theme.shadows.sm,
  },
  statusDropdownText: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
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
  iosOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  iosPickerContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    paddingBottom: 0,
  },
  iosDoneButton: {
    padding: theme.spacing.md,
    alignItems: 'flex-end',
  },
  iosDoneButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
  },
  attachmentPreviewContainer: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    position: 'relative',
    ...theme.shadows.sm,
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.radius.xs,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  fileName: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: theme.typography.sm,
  },
  attachmentActions: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
  },
  removeButton: {
    padding: theme.spacing.xxs,
  },
  attachmentButton: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  attachmentButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
    fontSize: theme.typography.sm,
  },
  noChecklistText: {
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: theme.spacing.md,
    fontSize: theme.typography.sm,
  },
});

export default TripStart;