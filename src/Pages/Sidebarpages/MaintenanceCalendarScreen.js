import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import Header from '../../components/Header'; // adjust path as per your project
import { useNavigation } from '@react-navigation/native';

const MaintenanceCalendarScreen = () => {
    const navigation = useNavigation();
  const [markedDates, setMarkedDates] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Dummy data: In real scenario, fetch from backend
  const appointmentData = {
    '2025-08-06': [
      {
        id: 1,
        time: '10:00 AM',
        vehicleId: 'V-001',
        inspector: 'John Doe',
        remarks: 'Oil change',
      },
      {
        id: 2,
        time: '2:00 PM',
        vehicleId: 'V-005',
        inspector: 'Jane Smith',
        remarks: 'Brake check',
      },
    ],
    '2025-08-08': [
      {
        id: 3,
        time: '9:00 AM',
        vehicleId: 'V-010',
        inspector: 'Mark Lee',
        remarks: 'Full service',
      },
    ],
  };

  useEffect(() => {
    // Convert appointmentData to marked format
    const marked = {};
    Object.keys(appointmentData).forEach(date => {
      marked[date] = {
        marked: true,
        dotColor: '#0284c7',
        selectedColor: '#bae6fd',
      };
    });
    setMarkedDates(marked);
  }, []);

  const onDayPress = day => {
    const date = day.dateString;
    setSelectedDate(date);
    setAppointments(appointmentData[date] || []);
  };

  const openAppointment = item => {
    setSelectedAppointment(item);
    setModalVisible(true);
  };

  return (
    <View style={{flex: 1}}>
      <StatusBar backgroundColor="#0284c7" barStyle="light-content" />
      <Header title="Maintenance Calendar"  onMenuPress={() => navigation.openDrawer()} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
          theme={{
            selectedDayBackgroundColor: '#0ea5e9',
            todayTextColor: '#0284c7',
          }}
        />

        {appointments.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={styles.sectionTitle}>
              Appointments on {selectedDate}
            </Text>
            <FlatList
              data={appointments}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.card}
                  // onPress={() => openAppointment(item)}
                  >
                  <Text style={styles.cardTitle}>
                    {item.time} - Vehicle: {item.vehicleId}
                  </Text>
                  <Text style={styles.cardSub}>
                    Inspector: {item.inspector}


                  </Text>
                  <Text style={styles.cardSub}>
                    Remarks: {item.remarks}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Appointment Details</Text>
              {selectedAppointment && (
                <>
                  <Text style={{fontSize: 16}}>
                    <Text style={{color: 'black', fontWeight: 'bold'}}>
                      Time:{' '}
                    </Text>
                    <Text style={{color: '#4B5563'}}>
                      {selectedAppointment.time}
                    </Text>
                  </Text>

                  <Text style={{fontSize: 16}}>
                    <Text style={{color: 'black', fontWeight: 'bold'}}>
                      Vehicle ID:{' '}
                    </Text>
                    <Text style={{color: '#4B5563'}}>
                      {selectedAppointment.vehicleId}
                    </Text>
                  </Text>

                  <Text style={{fontSize: 16}}>
                    <Text style={{color: 'black', fontWeight: 'bold'}}>
                      Inspector:{' '}
                    </Text>
                    <Text style={{color: '#4B5563'}}>
                      {selectedAppointment.inspector}
                    </Text>
                  </Text>

                  <Text style={{fontSize: 16}}>
                    <Text style={{color: 'black', fontWeight: 'bold'}}>
                      Remarks:{' '}
                    </Text>
                    <Text style={{color: '#4B5563'}}>
                      {selectedAppointment.remarks}
                    </Text>
                  </Text>
                </>
              )}

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
};

export default MaintenanceCalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  listContainer: {
    marginTop: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0284c7',
  },
  card: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e0f2fe',
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0c4a6e',
  },
  cardSub: {
    fontSize: 14,
    color: '#334155',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '85%',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 15,
    color: '#0284c7',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#0284c7',
    padding: 10,
    borderRadius: 8,
  },
  closeText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
