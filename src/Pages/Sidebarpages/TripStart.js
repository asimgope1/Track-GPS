import React, {useState, useEffect, useCallback, useRef} from 'react';
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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import Geolocation from '@react-native-community/geolocation';
import moment from 'moment';
import Header from '../../components/Header';
import { GETNETWORK } from '../../utils/Network';
import { BASE_URL } from '../../constants/url';
import { getObjByKey, storeObjByKey } from '../../utils/Storage';

const TripStart = ({navigation, route}) => {
  // Form state
  const [startDatetime, setStartDatetime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [startAddress, setStartAddress] = useState(location?.label || '');
  const [startKm, setStartKm] = useState('');
  const [startLat, setStartLat] = useState('');
  const [startLng, setStartLng] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Location state
  const [location, setLocation] = useState({});

  // Checklist state
  const [inspectionItems, setInspectionItems] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [inspectionResults, setInspectionResults] = useState({});
  const [selectedStatusDetails, setSelectedStatusDetails] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});
  const zIndexCounter = useRef(1000);

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
    }
  };

  const showDatePicker = () => {
    setPickerMode('date');
    setShowPicker(true);
  };

  // Location Handlers
  const getCurrentLocation = async () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          reverseGeocode(latitude, longitude);
          resolve({latitude, longitude});
        },
        error => {
          console.error('Error getting location:', error);
          if (error.code === 1) {
            Alert.alert(
              'Permission Denied',
              'Location permission is required to access your location.',
            );
          } else if (error.code === 2) {
            Alert.alert(
              'Position Unavailable',
              'Could not determine your location. Please try again.',
            );
          } else if (error.code === 3) {
            Alert.alert(
              'Request Timed Out',
              'Location request timed out. Please try again.',
            );
          } else {
            Alert.alert(
              'Unknown Error',
              'An unexpected error occurred. Please try again later.',
            );
          }
          reject(error);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  };

    const reverseGeocode = async (latitude, longitude) => {
    console.log('Reverse geocoding for:', latitude, longitude);
    setStartLat(latitude.toString());
    setStartLng(longitude.toString());
        try {
          const response = await fetch(
            `https://api.openrouteservice.org/geocode/reverse?api_key=eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImRhZmY2MTE0ZmNhYzRhZjViYTUyZjY0ZWMyMTRlYTI5IiwiaCI6Im11cm11cjY0In0=&point.lon=${longitude}&point.lat=${latitude}`,
          );
          const result = await response.json();
  
          const firstFeature = result?.features?.[0];
          if (firstFeature?.properties) {
            const {street, label} = firstFeature.properties;
  
            console.log('Street:', street);
            console.log('Label:', label);
  
            // Store minimal data
            const locationData = {
              street,
              label,
            };
            setLocation(locationData);
  
            storeObjByKey('location', locationData);
          } else {
            console.warn('No valid feature found in reverse geocode result');
          }
        } catch (error) {
          console.error('Error fetching reverse geocode:', error);
        }
  
      };

  // Checklist Handlers
  const fetchChecklistAndStatus = async () => {
    try {
      const response = await GETNETWORK(
        `${BASE_URL}maintenance/checklist/`,
        true,
      );
      const data = response?.data || [];

      // Extract statusOptions
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

      // Extract inspection items
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

  const handleStatusSelect = useCallback(
    (itemId, value) => {
      const selectedStatus = statusOptions.find(
        status => status.value === value,
      );
      setInspectionResults(prev => ({...prev, [itemId]: value}));
      setSelectedStatusDetails(prev => ({
        ...prev,
        [itemId]: selectedStatus || {},
      }));
      setOpenDropdowns(prev => ({...prev, [itemId]: false}));
    },
    [statusOptions],
  );

  // Helper functions
  const capitalize = str =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const getStatusColor = key => {
    const lower = key.toLowerCase();
    if (lower === 'ok') return '#22c55e';
    if (lower === 'attention' || lower === 'repair') return '#eab308';
    if (lower === 'replace') return '#ef4444';
    return '#94a3b8';
  };

  // Render Checklist Item
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
              setOpenDropdowns(prev => ({...prev, [item.id]: value}));
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
            modalProps={{animationType: 'fade'}}
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

  // Form Submission
  const handleSubmit = async () => {
    // if (!startAddress || !startKm || !startLat || !startLng) {
    //   Alert.alert('Error', 'Please fill all required fields');
    //   return;
    // }

    if (Object.keys(inspectionResults).length !== inspectionItems.length) {
      Alert.alert('Error', 'Please complete all checklist items');
      return;
    }

    setIsSubmitting(true);

    const loginRes = await getObjByKey('loginResponse');
        const token = loginRes?.data?.access_token;

    try {
      const formattedDateTime = moment(startDatetime).format(
        'YYYY-MM-DDTHH:mm:ss',
      );
      const checklistData = inspectionItems.map(item => ({
        checklist_master_id: item.id,
        selected_value: inspectionResults[item.id]
          .toLowerCase()
          .replace(' ', '_'),
      }));

      const tripData = {
        start_address: location?.label,
        start_datetime: formattedDateTime,
        start_km: parseFloat(startKm),
        start_lat: parseFloat(startLat),
        start_lng: parseFloat(startLng),
        checklist: checklistData,
      };
      console.log('tripDatastart', tripData);

      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      myHeaders.append('Authorization', `Bearer ${token}`);

      const response = await fetch(
        `${BASE_URL}trips/trip_start/${route.params?.trip?.trip_assignment_id}/`,
        {
          method: 'POST',
          headers: myHeaders,
          body: JSON.stringify(tripData),
        },
      );

      const result = await response.json();
      console.log('Trip Start Response:', result);

      if (!response.ok) {
        throw new Error(result.msg || 'Failed to start trip');
      }

      Alert.alert('Success', 'Trip started successfully!');
      // navigation.goBack();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to start trip');
    } finally {
      setIsSubmitting(false);
    }
  };
  console.log('location', location);
  console.log('routres', route.params?.trip?.trip_assignment_id);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <Header title="Trip Start" onMenuPress={() => navigation.openDrawer()} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Date & Time Picker */}
        <View style={styles.inputItem}>
          <Text style={styles.label}>Date & Time *</Text>
          <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
            <Text style={styles.dateButtonText}>
              {moment(startDatetime).format('DD MMM YYYY, hh:mm A')}
            </Text>
          </TouchableOpacity>

          {Platform.OS === 'android' && showPicker && (
            <DateTimePicker
              value={startDatetime}
              mode={pickerMode}
              display="default"
              onChange={onChangeDateTime}
              is24Hour={true}
              positiveButton={{label: 'OK', textColor: '#0284c7'}}
              negativeButton={{label: 'Cancel', textColor: '#ef4444'}}
            />
          )}

          {Platform.OS === 'ios' && (
            <Modal
              visible={showPicker}
              transparent={true}
              animationType="slide">
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
                />
                <TouchableOpacity
                  style={styles.iosDoneButton}
                  onPress={() => {
                    setShowPicker(false);
                    if (pickerMode === 'time') setPickerMode('date');
                  }}>
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
              style={[styles.input, {flex: 1}]}
              placeholderTextColor={'gray'}
              placeholder="Enter Location"
              value={location.label}
              onChangeText={text => setStartAddress(location.label)}
            />
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}>
              <Text style={styles.locationButtonText}>Get Current</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Odometer */}
        <View style={styles.inputItem}>
          <Text style={styles.label}>Odometer (km) *</Text>
          <TextInput
            style={styles.input}
            value={startKm}
            onChangeText={setStartKm}
            placeholder="Enter odometer reading"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        {/* Coordinates */}
        <View style={styles.coordinateContainer}>
          <View style={[styles.inputItem, {flex: 1, marginRight: 10}]}>
            <Text style={styles.label}>Latitude *</Text>
            <TextInput
              style={styles.input}
              value={startLat}
              onChangeText={setStartLat}
              placeholder="Auto-filled from location"
              keyboardType="numeric"
              placeholderTextColor="#999"
              editable={false}
            />
          </View>
          <View style={[styles.inputItem, {flex: 1}]}>
            <Text style={styles.label}>Longitude *</Text>
            <TextInput
              style={styles.input}
              value={startLng}
              onChangeText={setStartLng}
              placeholder="Auto-filled from location"
              keyboardType="numeric"
              placeholderTextColor="#999"
              editable={false}
            />
          </View>
        </View>

        {/* Checklist Section */}
        <Text style={styles.sectionHeader}>Pre-Trip Checklist *</Text>
        <View style={styles.tableContainer}>
          <FlatList
            data={inspectionItems}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}>
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Starting Trip...' : 'Start Trip'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  iosOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  iosPickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TripStart;
