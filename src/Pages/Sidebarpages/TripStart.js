import React, {useState} from 'react';
import {
  View,
  Text,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import Header from '../../components/Header';

const TripStart = ({navigation}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [location, setLocation] = useState('');
  const [odometer, setOdometer] = useState('');

  return (
    <>
      <StatusBar backgroundColor={'#0284c7'} barStyle="light-content" />
      <Header onMenuPress={() => navigation.openDrawer()} title="Trip Start" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Trip Start Date</Text>
          <Calendar
            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                marked: true,
                selectedColor: '#0284c7',
              },
            }}
            style={styles.calendar}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
placeholderTextColor={"gray"}            value={location}
            onChangeText={setLocation}
            placeholder="Enter start location"
            style={styles.input}
          />

          <Text style={styles.label}>Odometer Reading</Text>
          <TextInput
            value={odometer}
            placeholderTextColor={"gray"}
            onChangeText={setOdometer}
            placeholder="Enter odometer"
            keyboardType="numeric"
            style={styles.input}
          />

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Start Trip</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default TripStart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 16,
    color: '#333',
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 5,
  },
  input: {
    color:'black',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 6,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});