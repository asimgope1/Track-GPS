import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Image,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import Header from '../../components/Header';
import { BASE_URL } from '../../constants/url';
import { GETNETWORK, POSTNETWORK } from '../../utils/Network';
import { pick } from '@react-native-documents/picker';
import { Icon } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { getObjByKey, storeObjByKey } from '../../utils/Storage';
import Geolocation from '@react-native-community/geolocation';
import RNFetchBlob from 'react-native-blob-util';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Uncomment if using

const VehicleBreakdown = ({navigation}) => {
  const [incidentId, setIncidentId] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [tripId, setTripId] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [latitude, setlatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [driverName, setDriverName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({});

  // Vehicle Dropdown
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vehicleValue, setVehicleValue] = useState(null);
  const [vehicleItems, setVehicleItems] = useState([]);
  const [TripOpen, setTripOpen] = useState(false);
  const [TripValue, setTripValue] = useState(null);
  const [TripItems, setTripItems] = useState([]);

const handleAttachment = async () => {
  try {
    const pickResults = await pick(); // Returns an array of results
    console.log('Attachment selected:', pickResults);

    if (pickResults && pickResults.length > 0) {
      const pickResult = pickResults[0]; // Get the first selected file
      setAttachments([
        {
          uri: pickResult.uri,
          name: pickResult.name,
          type: pickResult.type,
        },
      ]);
    }
    console.log('pickResult', pickResults);
  } catch (error) {
    console.error('Error picking file:', error);
    alert('Failed to select file. Please try again.');
  }
};


  const removeAttachment = () => {
    setAttachments([]);
  };

const GetIncidentId = async () => {
  try {
    const Url = `${BASE_URL}maintenance/vehicle_breakdown/`;
    const response = await GETNETWORK(Url, true);
    console.log('Incident Data:', response?.latest_incident_number);

    if (response) {
      // Extract the numeric part and increment by 1
      const latestNumber = response?.latest_incident_number;
      setIncidentId(latestNumber);
    } else {
      alert('No incident number found in response.');
    }
  } catch (error) {
    console.error('Error fetching incidents:', error);
    alert('Failed to fetch incident data. Please try again.');
  }
};

  // Date Picker Handler
  const onChangeDate = (event, selectedDate) => {
    console.log('Selected date:', selectedDate);
    setShowDatePicker(false);
    if (selectedDate) {
      // Keep the existing time and only update the date portion
      const newDate = new Date(selectedDate);
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());
      setDate(newDate);
      console.log('Updated date:', newDate);
      // Show time picker after date is selected
      setShowTimePicker(true);
    }
  };

  // Time Picker Handler
  const onChangeTime = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      // Keep the existing date and only update the time portion
      const newDate = new Date(date);
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
      setDate(newDate);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };
const handleSubmit = async () => {
  console.log('date', date);
  try {
    const loginRes = await getObjByKey('loginResponse');
    const token = loginRes?.data?.access_token;

    if (!token) {
      alert('Authorization token missing.');
      return;
    }

    // Format the date to match your backend expectations
    const formattedDate = moment(date).format('YYYY-MM-DD HH:mm:ss');

    const formData = new FormData();
    formData.append('thing_id', vehicleValue);
    formData.append('driver_name', driverName);
    formData.append('reported_issue', description);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('created_on', formattedDate);
    formData.append('incident_id', incidentId);
    formData.append('trip_id', TripValue);

    if (attachments.length > 0) {
      formData.append('attachment', {
        uri: attachments[0].uri,
        name: attachments[0].name || 'upload.jpg',
        type: attachments[0].type || 'image/jpeg',
      });
    }
    console.log('breakdown', formData)

    const response = await fetch(`${BASE_URL}maintenance/vehicle_breakdown/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.msg || 'Failed to submit breakdown');
    }

    // Success case - you can access:
    // result.status ("success")
    // result.msg ("Breakdown reported successfully")
    // result.incident_id (17)
    // result.incident_number ("INC250000016")

    Alert.alert(
      'Success',
      `Breakdown reported successfully!\nIncident Number: ${result.incident_number}`,
      [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            // Optionally navigate somewhere
            // navigation.navigate('BreakdownList');
          },
        },
      ],
    );
  } catch (error) {
    console.error('Submission error:', error);
    Alert.alert(
      'Error',
      error.message || 'Failed to submit breakdown. Please try again.',
    );
  }
};



const resetForm = () => {
  setIncidentId('');
  setTripValue('');
  setVehicleValue('');
  setDate(new Date());
  setlatitude('');
  setLongitude('');
 removeAttachment()
  setLocation({});
  setDriverName('');
  setDescription('');
  setAttachments(null);
  GetVehicle();
  GetIncidentId();
  GetTrip();
  getCurrentLocation();
};




  useEffect(() => {
    // Fetch vehicle data when the component mounts
    GetVehicle();
    GetIncidentId();
    GetTrip();
    getCurrentLocation()
  }, []);


    const getCurrentLocation = async () => {
      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            console.log('Latitude:', latitude);
            console.log('Longitude:', longitude);
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
      setlatitude(latitude.toString());
      setLongitude(longitude.toString());
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

  const GetTrip = async () => {
    const Url = `${BASE_URL}trips/trip_master/`;

    try {
      const response = await GETNETWORK(Url, true);
      console.log('Trip Data:', response.data);

      const trips = response.data|| [];

      const mappedItems = trips.map(item => ({
        label: item.trip_name,
        value: item.trip_id,
      }));

      setTripItems(mappedItems);
    } catch (error) {
      console.error('Error fetching trips:', error);
      alert('Failed to fetch trip data. Please try again.');
    }
  }

  console.log('this is date', date);

  return (
    <>
      <StatusBar backgroundColor="#0284c7" barStyle="light-content" />
      <Header
        onMenuPress={() => navigation.openDrawer()}
        title="Vehicle Breakdown"
      />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Incident ID & Trip ID */}
        <View style={styles.row}>
          <View style={styles.inputItem}>
            <Text style={styles.label}>Incident ID</Text>
            <TextInput
              placeholderTextColor={'gray'}
              editable={false}
              style={styles.input}
              placeholder="Enter Incident ID"
              value={incidentId}
              onChangeText={setIncidentId}
            />
          </View>
          <View style={[styles.inputItem, {zIndex: vehicleOpen ? 1000 : 1}]}>
            <Text style={styles.label}>Trip ID</Text>
            <DropDownPicker
              open={TripOpen}
              value={TripValue}
              items={TripItems}
              setOpen={setTripOpen}
              setValue={setTripValue}
              setItems={setTripItems}
              placeholder="Select Trip"
              searchable={true}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              modalProps={{
                animationType: 'slide',
              }}
              modalContentContainerStyle={styles.modalContent}
              modalTitle="Select Trip"
              modalTitleStyle={styles.modalTitle}
            />
          </View>
        </View>

        {/* Vehicle ID & Date */}
        <View style={styles.row}>
          <View style={[styles.inputItem, {zIndex: vehicleOpen ? 1100 : 1}]}>
            <Text style={styles.label}>Vehicle ID</Text>
            <DropDownPicker
              open={vehicleOpen}
              value={vehicleValue}
              items={vehicleItems}
              setOpen={setVehicleOpen}
              setValue={setVehicleValue}
              setItems={setVehicleItems}
              placeholder="Select Vehicle"
              searchable={true}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              modalProps={{
                animationType: 'slide',
              }}
              modalContentContainerStyle={styles.modalContent}
              modalTitle="Select Vehicle"
              modalTitleStyle={styles.modalTitle}
            />
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.label}>Date & Time</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>
                {moment(date).format('DD MMM YYYY, hh:mm A')}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                testID="datePicker"
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChangeDate}
                {...(Platform.OS === 'android' && {
                  positiveButton: {
                    label: 'OK',
                    textColor: '#0284c7',
                  },
                  negativeButton: {
                    label: 'Cancel',
                    textColor: '#ef4444',
                  },
                })}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                testID="timePicker"
                value={date}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChangeTime}
                is24Hour={true}
                {...(Platform.OS === 'android' && {
                  positiveButton: {
                    label: 'OK',
                    textColor: '#0284c7',
                  },
                  negativeButton: {
                    label: 'Cancel',
                    textColor: '#ef4444',
                  },
                })}
              />
            )}
          </View>
        </View>

        {/* Location & Driver */}
        {/* <View style={styles.row}>
          <View style={styles.inputItem}>
            <Text style={styles.label}>Latitude</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={'gray'}
              placeholder="Enter latitude"
              value={latitude}
              onChangeText={setlatitude}
            />
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.label}>Longitute</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={'gray'}
              placeholder="Enter longitude"
              value={longitude}
              onChangeText={setLongitude}
            />
          </View>
        </View>

        <View style={{...styles.inputItem, marginBottom: 16}}>
          <Text style={styles.label}>Driver Name</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'gray'}
            placeholder="Enter driver name"
            value={driverName}
            onChangeText={setDriverName}
          />
        </View> */}

        <View style={styles.row}>
          <View style={styles.inputItem}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={'gray'}
              placeholder="Enter Location"
              value={location?.label || ''}
              onChangeText={text => setLocation({...location, label: text})}
              editable={false}
            />
          </View>
          {/* driver name */}
          <View style={styles.inputItem}>
            <Text style={styles.label}>Driver Name</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={'gray'}
              placeholder="Enter driver name"
              value={driverName}
              onChangeText={setDriverName}
            />
          </View>
          </View>

        {/* Description */}
        <View style={styles.inputItem}>
          <Text style={styles.label}>Description of Issue</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Describe the issue"
            placeholderTextColor={'gray'}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Attachment */}
        <View style={{...styles.inputItem, marginBottom: 16}}>
          <Text style={styles.label}>Attachments</Text>
          {attachments?.length > 0 ? (
            <View style={styles.attachmentPreviewContainer}>
              {attachments[0].type?.startsWith('image/') ? (
                <Image
                  source={{uri: attachments[0].uri}}
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
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={removeAttachment}>
                  <Icon name="close" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={handleAttachment}>
              <Text style={styles.attachmentButtonText}>Choose File</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Save Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9fafb',
    paddingBottom: 30,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputItem: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    color: 'black',
    height: 45,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
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
    paddingHorizontal: 12,
  },
  dateButtonText: {
    color: '#374151',
  },
  attachmentButton: {
    height: 45,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentButtonText: {
    color: '#374151',
    fontWeight: '500',
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
  attachmentPreviewContainer: {
    borderWidth: 1,
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
  },
  attachmentActions: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  removeButton: {
    padding: 5,
  },
});

export default VehicleBreakdown;
