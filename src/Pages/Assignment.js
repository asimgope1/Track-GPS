import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {Icon} from '@rneui/themed';
import {GETNETWORK, POSTNETWORK} from '../utils/Network';
import {BLACK, GRAY} from '../constants/color';
import {Calendar} from 'react-native-calendars';
import {BASE_URL} from '../constants/url';

const API_URL = 'https://backend.epsumthings.com/route/';

const initialDates = {fromDate: '', toDate: ''};

const Assignment = ({visible, onClose, onSelect, id}) => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignDate, setAssignDate] = useState('');
  const [estimatedDay, setEstimatedDay] = useState('');
  const [fuelConsumption, setFuelConsumption] = useState('');
  const [dates, setDates] = useState(initialDates);
  const [calendarVisible, setcalendarVisible] = useState(false);

  const clearStates = () => {
    setSelectedRoute(null);
    setAssignDate('');
    setEstimatedDay('');
    setFuelConsumption('');
  };

  useEffect(() => {
    if (visible) {
      fetchRoutes();
    }
  }, [visible]);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await GETNETWORK(API_URL, true);
      if (result?.status === 'success') {
        setRoutes(
          result.data.map(route => ({
            label: route.route_name,
            value: route.id,
          })),
        );
      } else {
        Alert.alert('Error', 'Failed to fetch routes.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = item => {
    console.log('item selected', item);
    setSelectedRoute(item.value);
    onSelect?.(item.value); // Ensure onSelect is called only if provided÷\
  };

  const Assign = async () => {
    if (!selectedRoute || !assignDate || !estimatedDay || !fuelConsumption) {
      Alert.alert('Error', 'Please fill all the fields.');
      return;
    }

    const payload = {
      route_id: selectedRoute,
      assign_date: assignDate,
      estimated_day: parseInt(estimatedDay),
      fuel_consumption: parseFloat(fuelConsumption),
    };

    try {
      const response = await POSTNETWORK(
        `${BASE_URL}route/assign-route/${id}/`,
        payload,
        true,
      );
      console.log(response);

      if (response?.status === 'failed' && response?.msg) {
        Alert.alert('Error', response.msg);
        clearStates();
      } else if (response) {
        Alert.alert('Success', 'Route assigned successfully.');
        clearStates();
        onClose(); // Close modal after success
      } else {
        Alert.alert('Error', 'Failed to assign route.');
        clearStates();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Network error occurred.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Choose a Route</Text>

          {loading ? (
            <ActivityIndicator size="large" color="blue" />
          ) : (
            <>
              <Dropdown
                style={styles.dropdown}
                data={routes}
                labelField="label"
                valueField="value"
                placeholder="Select a Route"
                search
                value={selectedRoute}
                onChange={handleSelect}
                renderLeftIcon={() => (
                  <Icon
                    name="directions"
                    type="material"
                    color="blue"
                    size={20}
                    style={styles.icon}
                  />
                )}
                containerStyle={styles.dropdownContainer}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemContainerStyle={styles.itemContainerStyle}
                itemTextStyle={styles.itemTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
              />

              <TouchableOpacity onPress={() => setcalendarVisible(true)}>
                <View style={styles.input}>
                  <Text
                    style={{
                      color: assignDate ? BLACK : GRAY,
                      fontSize: 16,
                      justifyContent: 'center',
                    }}>
                    {assignDate || 'Assign Date'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Calendar Modal */}
              <Modal
                visible={calendarVisible}
                transparent={true}
                animationType="slide">
                <View style={styles.modalOverlay}>
                  <View style={styles.calendarContainer}>
                    <Calendar
                      onDayPress={day => {
                        setAssignDate(day.dateString);
                        setcalendarVisible(false);
                      }}
                    />

                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setcalendarVisible(false)}>
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <TextInput
                style={styles.input}
                placeholder="Estimated Day"
                placeholderTextColor={GRAY}
                value={estimatedDay}
                onChangeText={setEstimatedDay}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Fuel Consumption"
                placeholderTextColor={GRAY}
                value={fuelConsumption}
                onChangeText={setFuelConsumption}
                keyboardType="numeric"
              />
            </>
          )}

          <TouchableOpacity
            style={{...styles.closeButton, backgroundColor: 'blue'}}
            onPress={() => {
              Assign();
            }}>
            <Text style={styles.closeButtonText}>Assign</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={
              // clearStates();
              onClose
            }>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default Assignment;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  dropdown: {
    height: 55,
    borderColor: '#007bff',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  dropdownContainer: {
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
  },
  placeholderStyle: {
    color: 'gray',
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  itemContainerStyle: {
    paddingVertical: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.5,
  },
  itemTextStyle: {
    fontSize: 16,
    color: '#333',
  },
  inputSearchStyle: {
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 10,
  },
  iconStyle: {
    width: 25,
    height: 25,
  },
  icon: {
    marginRight: 10,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    height: 50,
    justifyContent: 'center',
    borderColor: '#007bff',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    marginTop: 10,
    fontSize: 16,
    color: BLACK,
  },
  calendar: {
    marginBottom: 20,
  },
  calendarContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: '90%',
    alignSelf: 'center',
  },
});
