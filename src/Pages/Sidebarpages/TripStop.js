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

const TripStop = ({ navigation, route, onClose }) => {
  const statusBarHeight = useStatusBarHeight();
  // Form state
  const [stopDatetime, setStopDatetime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [stopAddress, setStopAddress] = useState('');
  const [stopKm, setStopKm] = useState('');
  const [stopLat, setStopLat] = useState('');
  const [stopLng, setStopLng] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');
  const [remarks, setRemarks] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

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
    const currentDate = selectedDate || stopDatetime;
    setShowPicker(Platform.OS === 'ios');
    setStopDatetime(currentDate);

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
    if (moment(stopDatetime).isAfter(moment(), 'minute')) {
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
      setStopLat(latitude.toString());
      setStopLng(longitude.toString());
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
        setStopAddress(label);
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
    if (lower === 'replace') return '#ef4444';
    return '#94a3b8';
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!stopAddress) errors.address = 'Please enter or fetch a location';
    if (!stopKm || isNaN(stopKm) || parseFloat(stopKm) <= 0) errors.stopKm = 'Please enter a valid odometer reading';
    if (!stopLat) errors.latitude = 'Please fetch location to set latitude';
    if (!stopLng) errors.longitude = 'Please fetch location to set longitude';
    if (fuelConsumed && (isNaN(fuelConsumed) || parseFloat(fuelConsumed) < 0)) {
      errors.fuelConsumed = 'Please enter a valid fuel amount';
    }
    if (remarks.length > 200) errors.remarks = 'Remarks must be 200 characters or less';
    if (Object.keys(inspectionResults).length !== inspectionItems.length) {
      errors.checklist = 'Please complete all checklist items';
    }
    if (moment(stopDatetime).isAfter(moment(), 'minute')) {
      errors.date = 'Cannot select future dates';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('error', 'Validation Error', 'Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const loginRes = await getObjByKey('loginResponse');
      const token = loginRes?.data?.access_token;
      if (!token) throw new Error('Authentication token not available');

      const formdata = new FormData();
      formdata.append('stop_address', stopAddress);
      formdata.append('stop_datetime', moment(stopDatetime).format('YYYY-MM-DD HH:mm:ss'));
      formdata.append('stop_km', parseFloat(stopKm));
      formdata.append('stop_lat', parseFloat(stopLat));
      formdata.append('stop_lng', parseFloat(stopLng));
      if (fuelConsumed) formdata.append('fuel_consumed', parseFloat(fuelConsumed));
      if (remarks) formdata.append('remarks', remarks);
      formdata.append('checklist', JSON.stringify(
        inspectionItems.map(item => ({
          checklist_master_id: item.id,
          selected_value: inspectionResults[item.id].toLowerCase().replace(' ', '_'),
        }))
      ));

      if (attachments.length > 0) {
        formdata.append('uploaded_proof', {
          uri: attachments[0].uri,
          name: attachments[0].name,
          type: attachments[0].type,
        });
      }

      const tripId = route.params?.tripId || route.params?.trip?.trip_assignment_id || 1;
      const response = await fetch(`${BASE_URL}trips/trip_end/${tripId}/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formdata,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to end trip');

      const dismiss = () => {
        if (onClose) onClose();
        else if (navigation?.goBack) navigation.goBack();
      };
      Alert.alert('Success', 'Trip ended successfully!', [
        { text: 'OK', onPress: dismiss },
      ]);
      showToast('success', 'Trip Ended', 'Trip ended successfully');
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Failed to end trip. Please try again.';
      if (error.message.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication failed. Please login again.';
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

  // Render Checklist Item
  const renderItem = ({ item }) => {
    const selectedStatus = inspectionResults[item.id];
    const selectedStatusObj = statusOptions.find(opt => opt.value === selectedStatus);
    const isOpen = openDropdowns[item.id] || false;
    const zIndex = isOpen ? zIndexCounter.current++ : 1;

    return (
      <View style={[styles.tableRow, { zIndex }]}>
        <View style={styles.itemNameContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          {selectedStatus && (
            <Text style={[styles.selectedStatusText, { color: selectedStatusObj?.color }]}>
              {selectedStatusObj?.label}
            </Text>
          )}
        </View>
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
            setItems={() => {}}
            placeholder="Select Status"
            style={[styles.statusDropdown, selectedStatusObj && { backgroundColor: selectedStatusObj.color + '20' }]}
            textStyle={styles.statusDropdownText}
            placeholderStyle={styles.statusDropdownPlaceholder}
            labelStyle={selectedStatusObj && { color: selectedStatusObj.color }}
            listItemLabelStyle={item => ({ color: item.color, fontWeight: '600' })}
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Loading trip stop data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={48} color="#dc2626" />
        <Text style={styles.errorText}>Error loading data</Text>
        <Text style={styles.errorSubText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchChecklistAndStatus}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar backgroundColor="#0284c7" barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Header title="Trip Stop" onMenuPress={handleMenuPress} showCloseButton={!!onClose} />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Date & Time Picker */}
          <View style={styles.inputItem}>
            <Text style={styles.label}>Date & Time *</Text>
            <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
              <Text style={styles.dateButtonText}>
                {moment(stopDatetime).format('DD MMM YYYY, hh:mm A')}
              </Text>
            </TouchableOpacity>
            {formErrors.date && <Text style={styles.errorText}>{formErrors.date}</Text>}
            {Platform.OS === 'android' && showPicker && (
              <DateTimePicker
                value={stopDatetime}
                mode={pickerMode}
                display="default"
                onChange={onChangeDateTime}
                is24Hour={true}
                maximumDate={new Date()}
                positiveButton={{ label: 'OK', textColor: '#0284c7' }}
                negativeButton={{ label: 'Cancel', textColor: '#ef4444' }}
              />
            )}
            {Platform.OS === 'ios' && (
              <Modal visible={showPicker} transparent={true} animationType="slide">
                <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
                  <View style={styles.iosOverlay} />
                </TouchableWithoutFeedback>
                <View style={styles.iosPickerContainer}>
                  <DateTimePicker
                    value={stopDatetime}
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
          <View style={styles.inputItem}>
            <Text style={styles.label}>Location *</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }, formErrors.address && styles.errorInput]}
                placeholderTextColor="#9ca3af"
                placeholder="Enter or fetch location"
                value={stopAddress}
                onChangeText={text => {
                  setStopAddress(text);
                  setFormErrors(prev => ({ ...prev, address: null }));
                }}
              />
              <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
                <Text style={styles.locationButtonText}>Get Current</Text>
              </TouchableOpacity>
            </View>
            {formErrors.address && <Text style={styles.errorText}>{formErrors.address}</Text>}
          </View>

          {/* Odometer */}
          <View style={styles.inputItem}>
            <Text style={styles.label}>Odometer (km) *</Text>
            <TextInput
              style={[styles.input, formErrors.stopKm && styles.errorInput]}
              value={stopKm}
              onChangeText={text => {
                setStopKm(text);
                setFormErrors(prev => ({ ...prev, stopKm: null }));
              }}
              placeholder="Enter odometer reading"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
            {formErrors.stopKm && <Text style={styles.errorText}>{formErrors.stopKm}</Text>}
          </View>

          {/* Coordinates */}
          {/* <View style={styles.coordinateContainer}>
            <View style={[styles.inputItem, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Latitude *</Text>
              <TextInput
                style={[styles.input, formErrors.latitude && styles.errorInput]}
                value={stopLat}
                placeholder="Auto-filled from location"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
                editable={false}
              />
              {formErrors.latitude && <Text style={styles.errorText}>{formErrors.latitude}</Text>}
            </View>
            <View style={[styles.inputItem, { flex: 1 }]}>
              <Text style={styles.label}>Longitude *</Text>
              <TextInput
                style={[styles.input, formErrors.longitude && styles.errorInput]}
                value={stopLng}
                placeholder="Auto-filled from location"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
                editable={false}
              />
              {formErrors.longitude && <Text style={styles.errorText}>{formErrors.longitude}</Text>}
            </View>
          </View> */}

          {/* Fuel Consumed */}
          <View style={styles.inputItem}>
            <Text style={styles.label}>Fuel Consumed (liters)</Text>
            <TextInput
              style={[styles.input, formErrors.fuelConsumed && styles.errorInput]}
              value={fuelConsumed}
              onChangeText={text => {
                setFuelConsumed(text);
                setFormErrors(prev => ({ ...prev, fuelConsumed: null }));
              }}
              placeholder="Enter fuel consumed"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
            {formErrors.fuelConsumed && <Text style={styles.errorText}>{formErrors.fuelConsumed}</Text>}
          </View>

          {/* Remarks */}
          <View style={styles.inputItem}>
            <Text style={styles.label}>Remarks</Text>
            <View style={styles.commentsContainer}>
              <TextInput
                style={[styles.input, styles.multilineInput, formErrors.remarks && styles.errorInput]}
                placeholder="Enter any remarks (optional)"
                placeholderTextColor="#9ca3af"
                multiline={true}
                numberOfLines={4}
                value={remarks}
                onChangeText={text => {
                  setRemarks(text);
                  setFormErrors(prev => ({ ...prev, remarks: null }));
                }}
                maxLength={200}
              />
              <Text style={styles.charCount}>{remarks.length}/200</Text>
            </View>
            {formErrors.remarks && <Text style={styles.errorText}>{formErrors.remarks}</Text>}
          </View>

          {/* Attachments */}
          <View style={styles.inputItem}>
            <Text style={styles.label}>Attachments</Text>
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
                    <Icon name="insert-drive-file" size={40} color="#0284c7" />
                    <Text style={styles.fileName} numberOfLines={1}>
                      {attachments[0].name}
                    </Text>
                  </View>
                )}
                <View style={styles.attachmentActions}>
                  <TouchableOpacity style={styles.removeButton} onPress={removeAttachment}>
                    <Icon name="close" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.attachmentButton} onPress={handleAttachment}>
                <Text style={styles.attachmentButtonText}>Choose File (Max 10MB)</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Checklist Section */}
          <Text style={styles.sectionHeader}>Post-Trip Checklist *</Text>
          {inspectionItems.length === 0 ? (
            <Text style={styles.noChecklistText}>No checklist items available</Text>
          ) : (
            <View style={styles.tableContainer}>
              <FlatList
                data={inspectionItems}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
              />
              {formErrors.checklist && <Text style={styles.errorText}>{formErrors.checklist}</Text>}
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Stop Trip</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
        <Toast />
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
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    color: '#111827',
    height: 45,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
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
  errorInput: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  dateButton: {
    height: 45,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    color: '#374151',
    textAlign: 'center',
    fontSize: 16,
  },
  locationButton: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  coordinateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    paddingBottom: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: '600',
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
    color: '#111827',
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
  iosOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  iosPickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    paddingBottom: 0,
  },
  iosDoneButton: {
    padding: 15,
    alignItems: 'flex-end',
  },
  iosDoneButtonText: {
    color: '#0284c7',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#81a8b8',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 12,
  },
  errorSubText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  attachmentPreviewContainer: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
    position: 'relative',
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: 4,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  fileName: {
    marginLeft: 10,
    color: '#374151',
    flex: 1,
    fontSize: 14,
  },
  attachmentActions: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  removeButton: {
    padding: 5,
  },
  attachmentButton: {
    height: 45,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentButtonText: {
    color: '#374151',
    fontWeight: '500',
    fontSize: 14,
  },
  noChecklistText: {
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
    fontSize: 14,
  },
});

export default TripStop;