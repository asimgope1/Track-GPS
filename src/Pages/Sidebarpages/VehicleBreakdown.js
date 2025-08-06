import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import Header from '../../components/Header';
import { BASE_URL } from '../../constants/url';
import { GETNETWORK } from '../../utils/Network';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Uncomment if using

const VehicleBreakdown = ({navigation}) => {
  const [incidentId, setIncidentId] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [tripId, setTripId] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [latitude, setlatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [driverName, setDriverName] = useState('');
  const [description, setDescription] = useState('');

  // Vehicle Dropdown
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vehicleValue, setVehicleValue] = useState(null);
  const [vehicleItems, setVehicleItems] = useState([
  ]);
  const [TripOpen, setTripOpen] = useState(false);
  const [TripValue, setTripValue] = useState(null);
  const [TripItems, setTripItems] = useState([
  ]);

const handleAttachment = async () => {
  try {
    const res = await pick({
      type: [types.allFiles],
      allowMultiSelection: true,
      copyTo: 'cachesDirectory', // Recommended for better performance
    });

    const newAttachments = res.map(file => ({
      name: file.name || 'Unknown',
      size: file.size || 0,
      type: file.type || 'application/octet-stream',
      uri: file.uri,
      // For Android content URIs
      fileCopyUri: file.fileCopyUri,
    }));

    setAttachments([...attachments, ...newAttachments]);
  } catch (err) {
    if (err?.code === 'DOCUMENT_PICKER_CANCELED') {
      console.log('User cancelled file picker');
    } else {
      console.error('Error picking file:', err);
      Alert.alert('Error', 'Failed to select file');
    }
  }
};


  const handleSubmit = () => {
    const breakdownData = {
      incidentId,
      tripId,
      vehicleId: vehicleValue,
      date,
      location,
      driverName,
      description,
      attachments,
    };
    console.log('Breakdown submitted:', breakdownData);
  };

  useEffect(() => {
    // Fetch vehicle data when the component mounts
    GetVehicle();
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
                {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {/* Uncomment when using DateTimePicker */}
            {/* {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )} */}
          </View>
        </View>

        {/* Location & Driver */}
        <View style={styles.row}>
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
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={handleAttachment}>
            <Text style={styles.attachmentButtonText}>Choose File</Text>
          </TouchableOpacity>
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
});

export default VehicleBreakdown;
