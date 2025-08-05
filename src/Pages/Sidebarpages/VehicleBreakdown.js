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
import React, {useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import Header from '../../components/Header';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Uncomment if using

const VehicleBreakdown = ({navigation}) => {
  const [incidentId, setIncidentId] = useState('');
  const [tripId, setTripId] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [driverName, setDriverName] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);

  // Vehicle Dropdown
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vehicleValue, setVehicleValue] = useState(null);
  const [vehicleItems, setVehicleItems] = useState([
    {label: 'TRK-001', value: 'TRK-001'},
    {label: 'TRK-002', value: 'TRK-002'},
    {label: 'TRK-003', value: 'TRK-003'},
    {label: 'TRK-004', value: 'TRK-004'},
  ]);

  const handleAttachment = () => {
    console.log('Attachment button pressed');
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
          <View style={styles.inputItem}>
            <Text style={styles.label}>Trip ID</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={'gray'}
              placeholder="Enter Trip ID"
              value={tripId}
              onChangeText={setTripId}
            />
          </View>
        </View>

        {/* Vehicle ID & Date */}
        <View style={styles.row}>
          <View style={[styles.inputItem, {zIndex: vehicleOpen ? 1000 : 1}]}>
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
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={'gray'}
              placeholder="Enter location"
              value={location}
              onChangeText={setLocation}
            />
          </View>
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
        <View style={styles.inputItem}>
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
